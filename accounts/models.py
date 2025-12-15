from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = "M", "남성"
        FEMALE = "F", "여성"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    # 기본정보
    name_kor    = models.CharField("지원자", max_length=100, blank=True, default="")
    name_eng    = models.CharField("영문이름", max_length=100, blank=True, default="")
    gender      = models.CharField("성별", max_length=1, choices=Gender.choices)
    nationality = models.CharField("국적", max_length=100, blank=True, default="")

    # 주소 (우편번호 + 주소2칸)
    postal_code = models.CharField("우편번호", max_length=10, blank=True, default="")
    address1    = models.CharField("주소1", max_length=200, blank=True, default="")
    address2    = models.CharField("주소2", max_length=200, blank=True, default="")

    # 연락처
    phone       = models.CharField("전화번호", max_length=50, blank=True, default="")

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    # 이메일은 User.email 사용

    def __str__(self):
        return f"{self.user.username} profile"


