# RegisterView → POST /api/auth/register/
# MeView → GET/PATCH /api/auth/me/ (JWT 토큰 필요)
# PasswordChangeView → POST /api/auth/change-password/

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import (
    RegisterSerializer,
    MeDetailSerializer,
    MeUpdateSerializer,
    PasswordChangeSerializer,
)
from .models import UserProfile
class RegisterView(APIView):
    """
    회원가입: POST /api/auth/register/
    body: { "id": "아이디", "password": "비번", "password_confirm": "비번확인" }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        if s.is_valid():
            user = s.save()
            return Response(
                {"message": "회원가입 완료", "id": user.username},
                status=status.HTTP_201_CREATED,
            )
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    
class MeView(APIView):
    """
    내 정보:
    - GET   /api/auth/me/  → 내 정보 + 프로필 조회
    - PATCH /api/auth/me/  → 내 정보 + 프로필 수정
    """
    permission_classes = [permissions.IsAuthenticated]

    def _ensure_profile(self, user):
        """
        프로필이 없으면 gender 기본값을 넣어서 생성
        (UserProfile에서 gender만 필수라서 기본값으로 'M' 넣어둠)
        """
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                "gender": UserProfile.Gender.MALE,   # 임시 기본값 ("M")
            },
        )
        return profile

    def get(self, request):
        # 프로필 존재 보장 후 응답
        self._ensure_profile(request.user)
        data = MeDetailSerializer(request.user).data
        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request):
        # PATCH 시에도 프로필이 없을 수 있으니 보장
        self._ensure_profile(request.user)

        s = MeUpdateSerializer(
            instance=request.user,
            data=request.data,
            partial=True,
        )
        if s.is_valid():
            user = s.save()
            return Response(MeDetailSerializer(user).data, status=status.HTTP_200_OK)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """
    비밀번호 변경: POST /api/auth/change-password/
    body: {
      "current_password": "...",
      "new_password": "...",
      "new_password_confirm": "..."
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        s = PasswordChangeSerializer(
            data=request.data,
            context={"request": request},
        )
        if s.is_valid():
            s.save()
            return Response(
                {"message": "비밀번호가 변경되었습니다."},
                status=status.HTTP_200_OK,
            )
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

# 프로필이 없을 때도 gender에 임시값(MALE) 을 넣어서 생성하니까 → DB 에러 없이 안전하게 동작
# 이후에 프론트에서 PATCH 요청으로 gender를 "F"로 바꾸면 정상적으로 업데이트됨.