# career/models.py
from django.db import models
from django.contrib.auth.models import User

class CareerSession(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "진행중"
        CLOSED = "closed", "종료"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="career_sessions",
    )
    title = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="첫 메시지 요약 or 나중에 유저가 붙일 세션 이름",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    ready_for_recommend = models.BooleanField(
        default=False,
        help_text="(권장: deprecated) 추천 준비 여부는 CareerPortfolio에 두는 게 일관됨",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "career_sessions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.user.username}] {self.title or '무제 세션'}"


class CareerMessage(models.Model):
    class Sender(models.TextChoices):
        USER = "user", "사용자"
        ASSISTANT = "assistant", "AI"

    session = models.ForeignKey(
        CareerSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.CharField(max_length=10, choices=Sender.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "career_messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.session_id} / {self.sender}: {self.content[:30]}"


class CareerPortfolio(models.Model):
    # 유저당 1개
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="career_portfolio",
    )
    data = models.JSONField(
        default=dict,
        help_text="AI 서버에서 생성/업데이트한 포트폴리오 전체 JSON",
    )

    ready_for_recommend = models.BooleanField(
        default=False,
        help_text="추천 가능 상태인지 (AI control.ready_for_recommend를 저장)",
    )
    stage = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="AI control.stage (ex: collecting_info / ready_for_recommend)",
    )
    recommend_hint = models.TextField(
        blank=True,
        null=True,
        help_text="AI control.recommend_hint (정보 부족 시 안내)",
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "career_portfolios"

    def __str__(self):
        return f"{self.user.username} portfolio"


class Experience(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="experiences")
    title = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    tags = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class StandardResume(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="standard_resume")
    content = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}의 표준이력서"


class CoverLetter(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# 경험정리서류 : 스냅샷 + 결과 저장
class ExperienceDoc(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "대기"
        DONE = "DONE", "완료"
        FAILED = "FAILED", "실패"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="experience_docs")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    # ✅ 요구사항 핵심: DB에서 불러온 값들만 저장(스냅샷)
    snapshot = models.JSONField(default=dict)

    # 결과(문서 형태 JSON)
    result = models.JSONField(null=True, blank=True)

    template = models.CharField(max_length=50, default="default")
    language = models.CharField(max_length=10, default="ko")

    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "experience_docs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} ExperienceDoc #{self.id} ({self.status})"
