# career/views.py
import httpx
from django.conf import settings
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import (
    CareerSession,
    CareerMessage,
    CareerPortfolio,
    Experience,
    StandardResume,
    CoverLetter,
)
from .serializers import (
    CareerMessageCreateSerializer,
    CareerMessageListSerializer,
    RecommendInSerializer,
)


def _normalize_ai_base_uri() -> str:
    """
    settings.AI_BASE_URI 를 안전한 base url 형태로 정규화
    - 공백 제거
    - 끝 슬래시 제거
    - scheme(http:// or https://) 없으면 http:// 붙임
    """
    ai_base = (getattr(settings, "AI_BASE_URI", "") or "").strip().rstrip("/")
    if ai_base and not ai_base.startswith(("http://", "https://")):
        ai_base = "http://" + ai_base
    return ai_base


# -------------------------
# Career Session (list/create)
# -------------------------
class CareerSessionCreateView(APIView):
    """
    GET  /api/career/sessions/   -> 내 세션 리스트 조회
    POST /api/career/sessions/   -> 새 세션 생성
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        sessions = CareerSession.objects.filter(user=user).order_by("-created_at")

        sessions_data = [
            {
                "session_id": s.id,
                "title": s.title,
                "status": s.status,
                "ready_for_recommend": s.ready_for_recommend,
                "created_at": s.created_at,
            }
            for s in sessions
        ]
        return Response({"sessions": sessions_data}, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        session = CareerSession.objects.create(user=user)

        data = {
            "session_id": session.id,
            "status": session.status,
            "title": session.title,
            "created_at": session.created_at,
            "ready_for_recommend": session.ready_for_recommend,
        }
        return Response(data, status=status.HTTP_201_CREATED)


# -------------------------
# Career Messages (list/create) + AI chat
# -------------------------
class CareerSessionMessageView(APIView):
    """
    GET  /api/career/sessions/{session_id}/messages/  -> 메시지 조회
    POST /api/career/sessions/{session_id}/messages/ -> 유저 메시지 저장 + AI 응답 저장 + 포트폴리오 갱신
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id):
        user = request.user
        session = get_object_or_404(CareerSession, id=session_id, user=user)

        qs = CareerMessage.objects.filter(session=session).order_by("created_at")
        data = CareerMessageListSerializer(qs, many=True).data
        return Response({"messages": data}, status=status.HTTP_200_OK)

    def post(self, request, session_id):
        user = request.user
        session = get_object_or_404(CareerSession, id=session_id, user=user)

        # body 검증
        serializer = CareerMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content = serializer.validated_data["content"]

        # user 메시지 저장
        CareerMessage.objects.create(session=session, sender="user", content=content)

        # state + history 구성
        portfolio_obj, _ = CareerPortfolio.objects.get_or_create(
            user=user, defaults={"data": {}}
        )
        state = portfolio_obj.data or {}

        history_qs = CareerMessage.objects.filter(session=session).order_by("created_at")
        history = [{"role": m.sender, "content": m.content} for m in history_qs]

        payload = {
            "user_id": str(user.id),
            "session_id": str(session.id),
            "user_message": content,
            "state": state,
            "history": history,
        }

        ai_base = _normalize_ai_base_uri()
        if not ai_base:
            return Response(
                {"detail": "AI_BASE_URI가 설정되어 있지 않습니다."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # AI 호출
        try:
            with httpx.Client(timeout=60.0) as client:
                r = client.post(f"{ai_base}/api/v1/career/chat", json=payload)
                r.raise_for_status()
                ai_data = r.json()
        except httpx.TimeoutException:
            return Response({"detail": "AI 서버 응답이 지연되고 있어요."}, status=504)
        except httpx.HTTPStatusError as e:
            return Response(
                {"detail": "AI 서버 호출에 실패했어요.", "ai_status": e.response.status_code},
                status=502,
            )
        except httpx.RequestError:
            return Response({"detail": "AI 서버에 연결할 수 없어요."}, status=502)

        assistant_reply = ai_data.get("assistant_reply", "")
        portfolio_data = ai_data.get("portfolio", {}) or {}
        control = ai_data.get("control", {}) or {}

        # assistant 메시지 저장
        CareerMessage.objects.create(
            session=session, sender="assistant", content=assistant_reply
        )

        # 포트폴리오 upsert
        portfolio_obj, _ = CareerPortfolio.objects.get_or_create(
            user=user, defaults={"data": {}}
        )
        portfolio_obj.data = portfolio_data or {}
        portfolio_obj.save(update_fields=["data", "updated_at"])

        # ready_for_recommend 갱신
        ready = bool(control.get("ready_for_recommend", False))
        if ready != session.ready_for_recommend:
            session.ready_for_recommend = ready
            session.save(update_fields=["ready_for_recommend"])

        return Response(
            {"assistant_reply": assistant_reply, "portfolio": portfolio_data, "control": control},
            status=status.HTTP_200_OK,
        )


# -------------------------
# Career Recommend
# -------------------------
class CareerRecommendView(APIView):
    """
    POST /api/career/sessions/{session_id}/recommend/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        user = request.user
        session = get_object_or_404(CareerSession, id=session_id, user=user)

        if not session.ready_for_recommend:
            return Response(
                {"detail": "아직 추천을 하기에는 정보가 부족해요. 조금 더 전공/관심 직무/경험에 대해 이야기해 주세요."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RecommendInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        top_k = serializer.validated_data.get("top_k", 5)

        ai_base = _normalize_ai_base_uri()
        if not ai_base:
            return Response(
                {"detail": "AI_BASE_URI가 설정되어 있지 않습니다."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        params = {"user_id": str(user.id), "top_k": top_k}

        try:
            with httpx.Client(timeout=60.0) as client:
                r = client.get(f"{ai_base}/api/v1/career/recommend", params=params)
                r.raise_for_status()
                data = r.json()
        except httpx.TimeoutException:
            return Response({"detail": "AI 서버 응답이 지연되고 있어요."}, status=504)
        except httpx.HTTPStatusError as e:
            return Response(
                {"detail": "AI 서버 호출에 실패했어요.", "ai_status": e.response.status_code},
                status=502,
            )
        except httpx.RequestError:
            return Response({"detail": "AI 서버에 연결할 수 없어요."}, status=502)

        return Response(data, status=status.HTTP_200_OK)


# -------------------------
# Experience (list/create/delete)
# -------------------------
class ExperienceListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        experiences = Experience.objects.filter(user=request.user)

        data = [
            {
                "id": exp.id,
                "title": exp.title,
                "start_date": exp.start_date,
                "end_date": exp.end_date,
                "tags": exp.tags,
            }
            for exp in experiences
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        title = request.data.get("title")
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")
        tags = request.data.get("tags")

        if not title:
            return Response({"error": "제목은 필수입니다."}, status=status.HTTP_400_BAD_REQUEST)

        Experience.objects.create(
            user=request.user,
            title=title,
            start_date=start_date,
            end_date=end_date,
            tags=tags,
        )
        return Response(status=status.HTTP_201_CREATED)


class ExperienceDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            exp = Experience.objects.get(pk=pk, user=request.user)
            exp.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Experience.DoesNotExist:
            return Response(
                {"error": "해당 경험을 찾을 수 없거나 권한이 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )


# -------------------------
# Standard Resume (get/save)
# -------------------------
class StandardResumeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        resume, _ = StandardResume.objects.get_or_create(user=request.user)
        return Response(resume.content, status=status.HTTP_200_OK)

    def post(self, request):
        resume, _ = StandardResume.objects.get_or_create(user=request.user)
        resume.content = request.data
        resume.save()
        return Response({"message": "저장되었습니다."}, status=status.HTTP_200_OK)


# -------------------------
# CoverLetter list
# -------------------------
class CoverLetterListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        letters = CoverLetter.objects.filter(user=request.user).order_by("-created_at")
        data = [{"id": l.id, "title": l.title} for l in letters]
        return Response(data, status=status.HTTP_200_OK)
