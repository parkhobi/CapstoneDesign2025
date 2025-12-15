"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from accounts import views  # ★ 중요: accounts 앱의 views.py를 가져옵니다!

urlpatterns = [
    path('admin/', admin.site.urls),

    # accounts 앱의 URL들을 /api/auth/ 로 묶어서 사용
    path('api/auth/', include('accounts.urls')),

    # DRF 기본 로그인/로그아웃 (브라우저 browsable API용, 선택)
    path('api-auth/', include('rest_framework.urls')),
    
    path('', views.index, name='index'),          # 메인 페이지
    path('login/', views.login_view, name='login'), # 로그인 페이지
    path('signup/', views.signup_view, name='signup'),
    path('singupsuccess/', views.signupsuccess_view, name='signupsuccess'),
    path('resume/', views.resume_view, name='resume'),
    path('profile/', views.profile_view, name='profile'),
    path('mungteong/', views.mungteong_view, name='mungteong'),
    path('experience/', views.experience_view, name='experience'),
    path('chat/', views.chat_view, name='chat'),
    path('addinfo/', views.addinfo_view, name='addinfo'),
]

