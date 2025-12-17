# career/urls.py
from django.urls import path
from .views import (
    CareerSessionCreateView,
    CareerSessionMessageView,
    CareerRecommendView,
    CareerPortfolioMeView,
    ExperienceListCreateView,
    ExperienceDetailView,
    StandardResumeView,
    CoverLetterListView,
)

urlpatterns = [
    # 세션(대화창) 목록 + 생성
    path("sessions/", CareerSessionCreateView.as_view(), name="career_sessions"),

    # 채팅 메시지 조회/전송 
    path("sessions/<int:session_id>/messages/", CareerSessionMessageView.as_view(), name="career_messages"),

    # 추천 
    path("sessions/<int:session_id>/recommend/", CareerRecommendView.as_view(), name="career_recommend"),

    # 유저 포트폴리오 조회
    path("portfolio/me/", CareerPortfolioMeView.as_view(), name="career_portfolio_me"),

    path("experiences/", ExperienceListCreateView.as_view(), name="experience_list_create"),
    path("experiences/<int:pk>/", ExperienceDetailView.as_view(), name="experience_detail"),
    path("resume/standard/", StandardResumeView.as_view(), name="standard_resume"),
    path("coverletters/", CoverLetterListView.as_view(), name="coverletter_list"),
]
