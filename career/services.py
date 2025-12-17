# career/services.py
# 요구사항 : 무조건 DB에서 불러오기 
# create 요청 들어오면 이 함수로 snapshot 무조건 만들고 저장
from .models import CareerPortfolio, Experience, StandardResume, CoverLetter, CareerSession

def build_experience_snapshot(user):
    # Portfolio (유저당 1개)
    portfolio = None
    try:
        portfolio_obj = user.career_portfolio
        portfolio = {
            "data": portfolio_obj.data,
            "ready_for_recommend": portfolio_obj.ready_for_recommend,
            "stage": portfolio_obj.stage,
            "recommend_hint": portfolio_obj.recommend_hint,
            "updated_at": portfolio_obj.updated_at.isoformat() if portfolio_obj.updated_at else None,
        }
    except CareerPortfolio.DoesNotExist:
        portfolio = None

    # Experience 목록
    experiences = list(
        Experience.objects.filter(user=user)
        .order_by("-created_at")
        .values("id", "title", "start_date", "end_date", "tags", "created_at")
    )
    for e in experiences:
        e["start_date"] = e["start_date"].isoformat() if e["start_date"] else None
        e["end_date"] = e["end_date"].isoformat() if e["end_date"] else None
        e["created_at"] = e["created_at"].isoformat() if e["created_at"] else None

    # StandardResume (유저당 1개)
    standard_resume = None
    try:
        sr = user.standard_resume
        standard_resume = {
            "content": sr.content,
            "updated_at": sr.updated_at.isoformat() if sr.updated_at else None,
        }
    except StandardResume.DoesNotExist:
        standard_resume = None

    # CoverLetter 목록
    cover_letters = list(
        CoverLetter.objects.filter(user=user)
        .order_by("-updated_at")
        .values("id", "title", "content", "created_at", "updated_at")
    )
    for c in cover_letters:
        c["created_at"] = c["created_at"].isoformat() if c["created_at"] else None
        c["updated_at"] = c["updated_at"].isoformat() if c["updated_at"] else None

    # (선택) 세션/메시지 요약용 raw 데이터
    sessions = list(
        CareerSession.objects.filter(user=user)
        .order_by("-created_at")
        .values("id", "title", "status", "created_at", "updated_at")
    )
    for s in sessions:
        s["created_at"] = s["created_at"].isoformat() if s["created_at"] else None
        s["updated_at"] = s["updated_at"].isoformat() if s["updated_at"] else None

    return {
        "portfolio": portfolio,
        "experiences": experiences,
        "standard_resume": standard_resume,
        "cover_letters": cover_letters,
        "sessions": sessions,
    }
