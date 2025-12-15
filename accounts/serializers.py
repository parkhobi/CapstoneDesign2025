
# 회원가입 / 로그인
# accounts/serializers.py
from django.contrib.auth.models import User
from django.contrib.auth import password_validation
from rest_framework import serializers
from .models import UserProfile


# ── 회원가입: id/password/password_confirm 받아서 User 생성
class RegisterSerializer(serializers.Serializer):
    id = serializers.CharField(write_only=True, max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate_id(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("이미 사용 중인 ID입니다.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "비밀번호가 일치하지 않습니다."})
        return attrs

    def create(self, validated_data):
        username = validated_data["id"]
        password = validated_data["password"]
        user = User.objects.create_user(username=username, password=password)
        return user
        
        # 프로필은 일단 생성만(기본정보는 /me/에서 입력)
        # 성별은 필수라서, 기본정보 입력 전에 저장이 불가능하면 빈 프로필을 만들지 말고
        # /me/ GET에서 create 하도록 두는 방법도 있지만,
        # 지금은 "항상 프로필 존재" 흐름을 위해 기본값 없이 생성하지 않고, MeView에서 get_or_create 유지.


# ── 프로필(기본정보) 중첩 직렬화기
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "name_kor",
            "name_eng",
            "gender",        # "M" | "F"
            "nationality",
            "postal_code",
            "address1",
            "address2",
            "phone",
        ]


# ── 내 정보 조회 응답용 (항상 동일 스키마 반환)
class MeDetailSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="username", read_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ["id", "email", "profile"]


# ── 내 정보 수정용 (부분 수정 PATCH)
class MeUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ["email", "profile"]

    def update(self, instance, validated_data):
        # 1) User.email 업데이트
        if "email" in validated_data:
            instance.email = validated_data["email"]
            instance.save()

        # 2) 프로필 부분 업데이트 (없으면 생성)
        prof_data = validated_data.get("profile", None)
        if prof_data is not None:
            prof, _ = UserProfile.objects.get_or_create(
                user=instance,
                defaults={
                    "gender": UserProfile.Gender.MALE,  # 임시 기본값
                },
            )
            for k, v in prof_data.items():
                setattr(prof, k, v)
            prof.save()

        return instance


# ── 비밀번호 변경 (원하면 사용)
class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError({"current_password": "현재 비밀번호가 올바르지 않습니다."})
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "새 비밀번호가 일치하지 않습니다."})
        password_validation.validate_password(attrs["new_password"], user)
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
