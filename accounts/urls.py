from django.urls import path
from .views import RegisterView, MeView, PasswordChangeView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', PasswordChangeView.as_view(), name='change_password'),
]

# 여기서 로그인은 우리가 직접 구현 안 하고
# simplejwt가 제공하는 TokenObtainPairView 사용 
# 👉 /login/이 로그인 엔드포인트가 됨.