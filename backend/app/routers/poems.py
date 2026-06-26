"""
Poems Router
============
CRUD operations for Manzumat (Islamic poems) with audio support.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.poem import Poem
from app.models.user import User
from app.schemas.poem import PoemCreate, PoemUpdate, PoemResponse
from app.security.auth import require_admin, get_current_user

router = APIRouter(prefix="/api/poems", tags=["Poems"])


def _poem_to_response(poem: Poem) -> dict:
    """Convert poem model to response dict."""
    return {
        "id": poem.id,
        "title": poem.title,
        "author": poem.author,
        "description": poem.description,
        "text_content": poem.text_content,
        "audio_path": poem.audio_path,
        "verse_count": poem.verse_count,
        "subject": poem.subject,
        "is_published": poem.is_published,
        "is_featured": poem.is_featured,
        "category_id": poem.category_id,
        "category_name": poem.category.name if poem.category else None,
        "created_at": poem.created_at,
    }


@router.get("/", response_model=List[PoemResponse])
async def get_poems(
    request: Request,
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None, max_length=200),
    include_unpublished: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Get poems with optional filtering and pagination."""
    if include_unpublished:
        user = await get_current_user(request, db)
        if user.role != "admin":
            raise HTTPException(status_code=403, detail="هذا الإجراء يتطلب صلاحيات المدير")
        query = db.query(Poem)
    else:
        query = db.query(Poem).filter(Poem.is_published == True)

    if category_id:
        query = query.filter(Poem.category_id == category_id)
    if search:
        from app.security.sanitizer import sanitize_search_query
        clean_search = sanitize_search_query(search)
        query = query.filter(Poem.title.ilike(f"%{clean_search}%"))

    poems = query.order_by(desc(Poem.created_at)).offset(skip).limit(limit).all()
    return [_poem_to_response(p) for p in poems]


@router.get("/latest", response_model=List[PoemResponse])
async def get_latest_poems(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Get the most recently added poems."""
    poems = (
        db.query(Poem)
        .filter(Poem.is_published == True)
        .order_by(desc(Poem.created_at))
        .limit(limit)
        .all()
    )
    return [_poem_to_response(p) for p in poems]


@router.get("/{poem_id}", response_model=PoemResponse)
async def get_poem(poem_id: int, db: Session = Depends(get_db)):
    """Get a single poem with full text and audio path."""
    poem = db.query(Poem).filter(Poem.id == poem_id).first()
    if not poem:
        raise HTTPException(status_code=404, detail="المنظومة غير موجودة")
    return _poem_to_response(poem)


@router.post("/", response_model=PoemResponse, status_code=status.HTTP_201_CREATED)
async def create_poem(
    data: PoemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new poem (admin only)."""
    poem = Poem(**data.model_dump())
    db.add(poem)
    db.commit()
    db.refresh(poem)
    return _poem_to_response(poem)


@router.put("/{poem_id}", response_model=PoemResponse)
async def update_poem(
    poem_id: int,
    data: PoemUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a poem (admin only)."""
    poem = db.query(Poem).filter(Poem.id == poem_id).first()
    if not poem:
        raise HTTPException(status_code=404, detail="المنظومة غير موجودة")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(poem, field, value)

    db.commit()
    db.refresh(poem)
    return _poem_to_response(poem)


@router.delete("/{poem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_poem(
    poem_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a poem (admin only)."""
    poem = db.query(Poem).filter(Poem.id == poem_id).first()
    if not poem:
        raise HTTPException(status_code=404, detail="المنظومة غير موجودة")
    db.delete(poem)
    db.commit()
