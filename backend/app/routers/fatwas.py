"""
Fatwas (Q&A) Router
===================
Public: submit questions and browse approved fatwas.
Admin: review, answer, approve/reject questions.
Implements strict rate limiting on submissions.
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.database import get_db
from app.models.fatwa import Fatwa, FatwaStatus
from app.models.user import User
from app.schemas.fatwa import FatwaSubmit, FatwaAnswer, FatwaResponse, FatwaAdminResponse
from app.security.auth import require_admin, get_current_user
from app.security.sanitizer import sanitize_search_query
from app.middleware.rate_limiter import limiter
from app.config import settings

router = APIRouter(prefix="/api/fatwas", tags=["Fatwas"])


# ─── Public Endpoints ─────────────────────────────────────────

@router.get("/", response_model=List[FatwaResponse])
async def get_approved_fatwas(
    search: Optional[str] = Query(None, max_length=200),
    topic: Optional[str] = Query(None, max_length=100),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Get approved (published) fatwas with instant search.
    Public endpoint - no authentication required.
    """
    query = db.query(Fatwa).filter(Fatwa.status == FatwaStatus.APPROVED, Fatwa.is_private == False)

    if topic:
        query = query.filter(Fatwa.topic == sanitize_search_query(topic))

    if search:
        clean_search = sanitize_search_query(search)
        query = query.filter(
            or_(
                Fatwa.question.ilike(f"%{clean_search}%"),
                Fatwa.answer.ilike(f"%{clean_search}%"),
            )
        )

    fatwas = query.order_by(desc(Fatwa.answered_at)).offset(skip).limit(limit).all()
    return [FatwaResponse.model_validate(f) for f in fatwas]


@router.get("/topics", response_model=List[str])
async def get_fatwa_topics(db: Session = Depends(get_db)):
    """Get unique topic names for filtering."""
    topics = (
        db.query(Fatwa.topic)
        .filter(Fatwa.status == FatwaStatus.APPROVED, Fatwa.topic.isnot(None))
        .distinct()
        .all()
    )
    return [t[0] for t in topics if t[0]]


@router.get("/lookup", response_model=FatwaResponse)
async def lookup_private_fatwa(
    code: str = Query(..., min_length=4, max_length=50),
    db: Session = Depends(get_db)
):
    """
    Lookup a fatwa (public or private) by its unique ticket code.
    This allows inquirers to retrieve answers to private questions securely and anonymously.
    """
    clean_code = code.strip().upper()
    fatwa = db.query(Fatwa).filter(Fatwa.ticket_code == clean_code).first()
    if not fatwa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="رمز التذكرة غير صحيح أو السؤال غير موجود"
        )
    return FatwaResponse.model_validate(fatwa)



@router.post("/submit", response_model=FatwaResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_FATWA_SUBMIT)
async def submit_question(
    request: Request,
    data: FatwaSubmit,
    db: Session = Depends(get_db),
):
    """
    Submit a new question to the Sheikh.
    RATE LIMITED: 5 questions per hour per IP address.
    All inputs are sanitized to prevent XSS/injection.
    """
    # Get submitter IP for rate limiting and abuse tracking
    client_ip = request.client.host if request.client else None

    import secrets
    # Generate unique ticket_code format BHJ-XXXX-XXXX
    ticket_code = None
    for _ in range(5):
        token = secrets.token_hex(4).upper()
        code = f"BHJ-{token[:4]}-{token[4:]}"
        if not db.query(Fatwa).filter(Fatwa.ticket_code == code).first():
            ticket_code = code
            break
    if not ticket_code:
        ticket_code = f"BHJ-{secrets.token_hex(6).upper()}"

    fatwa = Fatwa(
        question=data.question,
        questioner_name=data.questioner_name,
        questioner_email=data.questioner_email,
        questioner_whatsapp=data.questioner_whatsapp,
        is_private=data.is_private,
        notification_method=data.notification_method,
        submitter_ip=client_ip,
        status=FatwaStatus.PENDING,
        topic=data.topic,
        ticket_code=ticket_code,
    )

    db.add(fatwa)
    db.commit()
    db.refresh(fatwa)

    return FatwaResponse.model_validate(fatwa)



# ─── Admin Endpoints ──────────────────────────────────────────

@router.get("/pending", response_model=List[FatwaAdminResponse])
async def get_pending_fatwas(
    status_filter: Optional[FatwaStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Get pending/all fatwas for admin review."""
    query = db.query(Fatwa)

    if status_filter:
        query = query.filter(Fatwa.status == status_filter)
    else:
        # Default: show pending first
        query = query.filter(Fatwa.status == FatwaStatus.PENDING)

    fatwas = query.order_by(desc(Fatwa.created_at)).offset(skip).limit(limit).all()
    return [FatwaAdminResponse.model_validate(f) for f in fatwas]


@router.get("/stats")
async def get_fatwa_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Get fatwa statistics for admin dashboard."""
    total = db.query(Fatwa).count()
    pending = db.query(Fatwa).filter(Fatwa.status == FatwaStatus.PENDING).count()
    approved = db.query(Fatwa).filter(Fatwa.status == FatwaStatus.APPROVED).count()
    rejected = db.query(Fatwa).filter(Fatwa.status == FatwaStatus.REJECTED).count()

    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
    }


@router.put("/{fatwa_id}/answer", response_model=FatwaAdminResponse)
async def answer_fatwa(
    fatwa_id: int,
    data: FatwaAnswer,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Answer a fatwa and set its status (admin only)."""
    fatwa = db.query(Fatwa).filter(Fatwa.id == fatwa_id).first()
    if not fatwa:
        raise HTTPException(status_code=404, detail="السؤال غير موجود")

    fatwa.answer = data.answer
    fatwa.status = data.status
    fatwa.answered_by = admin.display_name or admin.username
    fatwa.answered_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(fatwa)

    # Trigger notification services if approved and not yet sent
    if fatwa.status == FatwaStatus.APPROVED and not fatwa.is_answered_and_sent:
        if fatwa.is_private:
            if fatwa.notification_method == "email" and fatwa.questioner_email:
                from app.services.email import send_private_answer
                sent = send_private_answer(fatwa.questioner_email, fatwa.question, fatwa.answer)
                if sent:
                    fatwa.is_answered_and_sent = True
            elif fatwa.notification_method == "whatsapp" and fatwa.questioner_whatsapp:
                from app.services.whatsapp import send_private_answer_whatsapp
                sent = send_private_answer_whatsapp(fatwa.questioner_whatsapp, fatwa.question, fatwa.answer)
                if sent:
                    fatwa.is_answered_and_sent = True
        else:
            # Public question notification alert if email is provided
            if fatwa.questioner_email:
                from app.services.email import send_public_answer_alert
                send_public_answer_alert(fatwa.questioner_email, fatwa.question)
                fatwa.is_answered_and_sent = True

        db.commit()
        db.refresh(fatwa)

    return FatwaAdminResponse.model_validate(fatwa)


@router.put("/{fatwa_id}/reject")
async def reject_fatwa(
    fatwa_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Reject a fatwa question (admin only)."""
    fatwa = db.query(Fatwa).filter(Fatwa.id == fatwa_id).first()
    if not fatwa:
        raise HTTPException(status_code=404, detail="السؤال غير موجود")

    fatwa.status = FatwaStatus.REJECTED
    db.commit()

    return {"message": "تم رفض السؤال"}


@router.delete("/{fatwa_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fatwa(
    fatwa_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Permanently delete a fatwa (admin only)."""
    fatwa = db.query(Fatwa).filter(Fatwa.id == fatwa_id).first()
    if not fatwa:
        raise HTTPException(status_code=404, detail="السؤال غير موجود")
    db.delete(fatwa)
    db.commit()
