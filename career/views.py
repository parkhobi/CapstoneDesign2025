# career/views.py
import httpx
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404

from .models import CareerSession, CareerMessage, CareerPortfolio
from .serializers import CareerMessageCreateSerializer, CareerMessageListSerializer
from .serializers import RecommendInSerializer

class CareerSessionCreateView(APIView):
    """
    GET  /api/career/sessions/   -> 내 세션 리스트 조회
    POST /api/career/sessions/   -> 새 세션 생성
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        sessions = (
            CareerSession.objects
            .filter(user=user)
            .order_by("-created_at")
        )

        sessions_data = []
        for s in sessions:
            sessions_data.append({
                "session_id": s.id,
                "title": s.title,
                "status": s.status,
                "ready_for_recommend": s.ready_for_recommend,
                "created_at": s.created_at,
            })

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


class CareerSessionMessageView(APIView):
    """
    POST /api/career/sessions/{session_id}/messages/
    - 유저 메시지 저장
    - (지금은) AI 서버 없이 더미 assistant 응답 + 포트폴리오 업데이트
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id):
        print("✅ GET HIT:", session_id)
        user = request.user

        # 1) 세션 소유자 확인
        session = get_object_or_404(CareerSession, id=session_id, user=user)

        # 2) 세션에 속한 메시지 시간순 조회
        qs = CareerMessage.objects.filter(session=session).order_by("created_at")

        # 3) 직렬화
        data = CareerMessageListSerializer(qs, many=True).data

        # 4) 응답 (네가 준 예시 형태)
        return Response({"messages": data}, status=status.HTTP_200_OK)
    


    def post(self, request, session_id):
        user = request.user

        # 1) 세션 소유자 확인 (내 세션만 접근 가능)
        session = get_object_or_404(CareerSession, id=session_id, user=user)

        # 2) 요청 Body 검증
        serializer = CareerMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content = serializer.validated_data["content"]

        # 3) DB에 user 메시지 저장
        CareerMessage.objects.create(
            session=session,
            sender="user",
            content=content,
        )

        # 4) AI 서버 호출 준비: state(포트폴리오) + history 구성
        portfolio_obj, _ = CareerPortfolio.objects.get_or_create(user=user, defaults={"data": {}})
        state = portfolio_obj.data or {}

        history_qs = CareerMessage.objects.filter(session=session).order_by("created_at")
        history = [{"role": m.sender, "content": m.content} for m in history_qs]  # user/assistant

        payload = {
            "user_id": str(user.id),
            "session_id": str(session.id),
            "user_message": content,
            "state": state,
            "history": history,
            }

        ai_base = getattr(settings, "AI_BASE_URI", "").rstrip("/")
        try:
            with httpx.Client(timeout=60.0) as client:
                r = client.post(f"{ai_base}/api/v1/career/chat", json=payload)
                r.raise_for_status()
                ai_data = r.json()
        except httpx.TimeoutException:
            return Response({"detail": "AI 서버 응답이 지연되고 있어요."}, status=504)
        except httpx.HTTPStatusError as e:
            return Response({"detail": "AI 서버 호출에 실패했어요.", "ai_status": e.response.status_code}, status=502)

        assistant_reply = ai_data.get("assistant_reply", "")
        portfolio_data = ai_data.get("portfolio", {}) or {}
        control = ai_data.get("control", {}) or {}

        # 5) DB에 assistant 메시지 저장
        CareerMessage.objects.create(
            session=session,
            sender="assistant",
            content=assistant_reply,
        )

        # 6) 포트폴리오 upsert (있으면 수정, 없으면 생성)
        portfolio_obj, _ = CareerPortfolio.objects.get_or_create(
            user=user,
            defaults={"data": {}},
        )
        portfolio_obj.data = portfolio_data or {}
        portfolio_obj.save(update_fields=["data", "updated_at"])

        # 7) ready_for_recommend 플래그 갱신
        ready = bool(control.get("ready_for_recommend", False))
        if ready != session.ready_for_recommend:
            session.ready_for_recommend = ready
            session.save(update_fields=["ready_for_recommend"])

        # 8) 응답
        return Response(
            {
                "assistant_reply": assistant_reply,
                "portfolio": portfolio_data,
                "control": control,
            },
            status=status.HTTP_200_OK,
        )
    
class CareerRecommendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        user = request.user
        session = get_object_or_404(CareerSession, id=session_id, user=user)

        # 1) ready_for_recommend 체크
        if not session.ready_for_recommend:
            return Response(
                {"detail": "아직 추천을 하기에는 정보가 부족해요. 조금 더 전공/관심 직무/경험에 대해 이야기해 주세요."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2) body 검증
        serializer = RecommendInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        top_k = serializer.validated_data.get("top_k", 5)

        # 3) AI recommend 호출 (AI 명세: GET /api/v1/career/recommend?user_id=...&top_k=...)
        ai_base = getattr(settings, "AI_BASE_URI", "")

        ai_base = (ai_base or "").strip().rstrip("/")
        if ai_base and not ai_base.startswith(("http://", "https://")):
            ai_base = "http://" + ai_base

        print("AI_BASE_URI FIXED =", repr(ai_base))

        params = {"user_id": str(user.id), "top_k": top_k}

        try:
            with httpx.Client(timeout=60.0) as client:
                r = client.get(f"{ai_base}/api/v1/career/recommend", params=params)
                r.raise_for_status()
                data = r.json()
        except httpx.TimeoutException:
            return Response({"detail": "AI 서버 응답이 지연되고 있어요."}, status=504)
        except httpx.HTTPStatusError as e:
            return Response({"detail": "AI 서버 호출에 실패했어요.", "ai_status": e.response.status_code}, status=502)

        return Response(data, status=status.HTTP_200_OK)