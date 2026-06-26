"""
Videos Router
=============
CRUD operations for videos (YouTube embedded content).
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.video import Video
from app.models.user import User
from app.schemas.video import VideoCreate, VideoUpdate, VideoResponse, extract_youtube_id
from app.security.auth import require_admin, get_current_user
from app.security.sanitizer import sanitize_search_query

router = APIRouter(prefix="/api/videos", tags=["Videos"])


@router.get("/", response_model=List[VideoResponse])
async def get_videos(
    request: Request,
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None, max_length=200),
    include_unpublished: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Get videos with optional category filtering, search, and pagination."""
    if include_unpublished:
        user = await get_current_user(request, db)
        if user.role != "admin":
            raise HTTPException(status_code=403, detail="هذا الإجراء يتطلب صلاحيات المدير")
        query = db.query(Video)
    else:
        query = db.query(Video).filter(Video.is_published == True)

    if category:
        query = query.filter(Video.category_name == category)
    if search:
        clean_search = sanitize_search_query(search)
        query = query.filter(
            (Video.title.ilike(f"%{clean_search}%")) |
            (Video.description.ilike(f"%{clean_search}%"))
        )

    videos = query.order_by(desc(Video.created_at)).offset(skip).limit(limit).all()
    return videos


@router.get("/latest", response_model=List[VideoResponse])
async def get_latest_videos(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Get the most recently added videos."""
    videos = (
        db.query(Video)
        .filter(Video.is_published == True)
        .order_by(desc(Video.created_at))
        .limit(limit)
        .all()
    )
    return videos


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(video_id: int, db: Session = Depends(get_db)):
    """Get a single video by ID."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="الفيديو غير موجود")
    return video


@router.post("/", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def create_video(
    data: VideoCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new video (admin only)."""
    yt_id = extract_youtube_id(data.youtube_url)
    if not yt_id:
        raise HTTPException(status_code=400, detail="رابط يوتيوب غير صالح")
        
    video = Video(
        title=data.title,
        description=data.description,
        youtube_url=data.youtube_url,
        youtube_id=yt_id,
        category_name=data.category_name,
        is_published=data.is_published
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.put("/{video_id}", response_model=VideoResponse)
async def update_video(
    video_id: int,
    data: VideoUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a video (admin only)."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="الفيديو غير موجود")

    update_data = data.model_dump(exclude_unset=True)
    
    # If URL is being updated, extract new youtube_id
    if "youtube_url" in update_data and update_data["youtube_url"]:
        yt_id = extract_youtube_id(update_data["youtube_url"])
        if not yt_id:
            raise HTTPException(status_code=400, detail="رابط يوتيوب غير صالح")
        video.youtube_id = yt_id
        video.youtube_url = update_data["youtube_url"]
        
    # Update other fields
    for field, value in update_data.items():
        if field != "youtube_url":
            setattr(video, field, value)

    db.commit()
    db.refresh(video)
    return video


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a video (admin only)."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="الفيديو غير موجود")
    db.delete(video)
    db.commit()
