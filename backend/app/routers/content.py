"""
Content Router
==============
Manages dynamic site content (hero section, biography, etc.).
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import SiteContent
from app.models.user import User
from app.schemas.content import ContentUpdate, ContentResponse
from app.security.auth import require_admin

router = APIRouter(prefix="/api/content", tags=["Content"])


@router.get("/", response_model=List[ContentResponse])
async def get_all_content(
    section: Optional[str] = Query(None, max_length=50),
    db: Session = Depends(get_db),
):
    """Get all site content, optionally filtered by section."""
    query = db.query(SiteContent)
    if section:
        query = query.filter(SiteContent.section == section)
    return query.all()


@router.get("/{key}", response_model=ContentResponse)
async def get_content(key: str, db: Session = Depends(get_db)):
    """Get a specific content piece by its unique key."""
    content = db.query(SiteContent).filter(SiteContent.key == key).first()
    if not content:
        raise HTTPException(status_code=404, detail="المحتوى غير موجود")
    return content


@router.put("/{key}", response_model=ContentResponse)
async def update_content(
    key: str,
    data: ContentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a content piece (admin only). Creates it if it doesn't exist."""
    content = db.query(SiteContent).filter(SiteContent.key == key).first()

    if content:
        content.value = data.value
        content.content_type = data.content_type
    else:
        content = SiteContent(key=key, value=data.value, content_type=data.content_type)
        db.add(content)

    db.commit()
    db.refresh(content)
    return content
