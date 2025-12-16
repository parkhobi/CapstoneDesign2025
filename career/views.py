from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Experience 
from .models import StandardResume
from .models import Experience, CoverLetter, CareerSession  

# ★ [추가] 목록 조회(GET) 및 생성(POST) 담당
class ExperienceListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # 1. 목록 조회 (GET)
    def get(self, request):
        experiences = Experience.objects.filter(user=request.user)
        
        # DB 데이터를 JSON 리스트로 변환 (수동 변환)
        data = []
        for exp in experiences:
            data.append({
                'id': exp.id,
                'title': exp.title,
                'start_date': exp.start_date,
                'end_date': exp.end_date,
                'tags': exp.tags,
            })
        return Response(data)

    # 2. 경험 추가 (POST)
    def post(self, request):
        # 프론트에서 보낸 데이터 받기
        title = request.data.get('title')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        tags = request.data.get('tags')

        if not title:
            return Response({"error": "제목은 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

        # DB에 저장
        Experience.objects.create(
            user=request.user,
            title=title,
            start_date=start_date,
            end_date=end_date,
            tags=tags
        )
        return Response(status=status.HTTP_201_CREATED)

class ExperienceDetailView(APIView):
    # 로그인한 사람만 삭제 가능
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        """
        특정 경험(pk)을 삭제하는 기능
        """
        try:
            # 내 것(request.user) 중에서 해당 번호(pk)인 경험 찾기
            experience = Experience.objects.get(pk=pk, user=request.user)
            experience.delete() # DB에서 삭제!
            return Response(status=status.HTTP_204_NO_CONTENT) # 성공 (내용 없음)
            
        except Experience.DoesNotExist:
            return Response(
                {"error": "해당 경험을 찾을 수 없거나 권한이 없습니다."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
class StandardResumeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # 1. 이력서 불러오기 (GET)
    def get(self, request):
        # 없으면 새로 만듭니다 (get_or_create)
        resume, created = StandardResume.objects.get_or_create(user=request.user)
        return Response(resume.content)

    # 2. 이력서 저장하기 (POST)
    def post(self, request):
        resume, created = StandardResume.objects.get_or_create(user=request.user)
        resume.content = request.data # 프론트에서 보낸 JSON 통째로 저장
        resume.save()
        return Response({"message": "저장되었습니다."}, status=status.HTTP_200_OK)
    
    # career/views.py

# 회사별 자기소개서 목록 조회
class CoverLetterListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        letters = CoverLetter.objects.filter(user=request.user).order_by('-created_at')
        data = [{'id': l.id, 'title': l.title} for l in letters]
        return Response(data)

# 채팅(뭉텅이) 기록 목록 조회
class ChatSessionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = CareerSession.objects.filter(user=request.user).order_by('-updated_at')
        data = [{'id': s.id, 'title': s.title or "새로운 대화", 'date': s.updated_at.strftime("%Y.%m.%d")} for s in sessions]
        return Response(data)