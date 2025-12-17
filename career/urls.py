# career/urls.py
from django.urls import path
from .views import CareerSessionCreateView, CareerSessionMessageView

urlpatterns = [
    # 세션 목록 + 생성
    path("sessions/", CareerSessionCreateView.as_view(), name="career_session_create"),
    
    # 특정 세션에 메시지 전송
    path(
        "sessions/<int:session_id>/messages/",
        CareerSessionMessageView.as_view(),
        name="career_session_messages",
    ),
]



