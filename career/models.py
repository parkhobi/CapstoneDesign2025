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
        help_text="AI 추천(포트폴리오 생성)까지 완료되었는지 여부",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "career_sessions"   # 네가 정한 테이블 이름 그대로 사용
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
    sender = models.CharField(
        max_length=10,
        choices=Sender.choices,
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "career_messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.session_id} / {self.sender}: {self.content[:30]}"


class CareerPortfolio(models.Model):
    # user_id가 PK + FK 가 되도록 OneToOneField + primary_key=True
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="career_portfolio",
    )
    # JSONB 대신 Django의 JSONField 사용 (SQLite에서도 잘 동작)
    data = models.JSONField(
        default=dict,
        help_text="AI 서버에서 생성한 포트폴리오 전체 JSON",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "career_portfolios"

    def __str__(self):
        return f"{self.user.username} portfolio"

class Experience(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="experiences",
    )
    title = models.CharField(max_length=255)  # 경험 제목
    start_date = models.DateField(null=True, blank=True) # 시작일
    end_date = models.DateField(null=True, blank=True)   # 종료일
    tags = models.CharField(max_length=255, blank=True)  # 태그 (#도전 #성장)
    
    created_at = models.DateTimeField(auto_now_add=True) # 생성 시간

    class Meta:
        ordering = ["-created_at"] # 최신순 정렬

    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
class StandardResume(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='standard_resume')
    content = models.JSONField(default=dict) # 이력서 내용 전체를 저장
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}의 표준이력서"
    
class CoverLetter(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255) # 예: 삼성전자 자소서, 00기업 지원서
    content = models.TextField(blank=True)   # 자소서 내용
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title