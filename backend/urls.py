# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from accounts import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from career import views as career_views  

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 프론트: career 관련 API들
    path("api/experience/<int:pk>/", career_views.ExperienceDetailView.as_view(), name="experience_delete"),
    path("api/experiences/", career_views.ExperienceListCreateView.as_view(), name="experience_list_create"),
    path("api/resume/", career_views.StandardResumeView.as_view(), name="standard_resume"),
    path("api/cover-letters/", career_views.CoverLetterListView.as_view(), name="cover_letter_list"),

    path("api/chat-sessions/", career_views.CareerSessionCreateView.as_view(), name="chat_session_list"),

    # 기존 /api/chat-sessions/... 형태도 계속 쓸 수 있게 별칭 추가
    path(
        "api/chat-sessions/<int:session_id>/messages/",
        career_views.CareerSessionMessageView.as_view(),
        name="chat_session_messages",
    ),
    path(
        "api/chat-sessions/<int:session_id>/recommend/",
        career_views.CareerRecommendView.as_view(),
        name="chat_session_recommend",
    ),

    path("api/auth/", include("accounts.urls")),

    # DRF 기본 로그인/로그아웃
    path("api-auth/", include("rest_framework.urls")),

    # career API
    path("api/career/", include("career.urls")),

    # pages
    path("", views.index, name="index"), # 메인 페이지
    path("login/", views.login_view, name="login"), # 로그인 페이지
    path("signup/", views.signup_view, name="signup"),
    path("singupsuccess/", views.signupsuccess_view, name="signupsuccess"),
    path("resume/", views.resume_view, name="resume"),
    path("profile/", views.profile_view, name="profile"),
    path("mungteong/", views.mungteong_view, name="mungteong"),
    path("experience/", views.experience_view, name="experience"),
    path("chat/", views.chat_view, name="chat"),
    path("addinfo/", views.addinfo_view, name="addinfo"),
]
