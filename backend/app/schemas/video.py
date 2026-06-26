"""Pydantic schemas for Videos (YouTube embedded content)."""

import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.security.sanitizer import sanitize_text


def extract_youtube_id(url: str) -> Optional[str]:
    """
    Extract the 11-character YouTube video ID from various YouTube URL formats.
    """
    if not url:
        return None
    
    # Regular expressions for different YouTube link styles
    patterns = [
        r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
        r'(?:https?://)?(?:www\.)?youtu\.be/([a-zA-Z0-9_-]{11})',
        r'(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{11})',
        r'(?:https?://)?(?:www\.)?youtube\.com/shorts/([a-zA-Z0-9_-]{11})',
        r'(?:https?://)?(?:www\.)?youtube\.com/v/([a-zA-Z0-9_-]{11})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url, re.IGNORECASE)
        if match:
            return match.group(1)
            
    # Generic fallback regex for any 11-char ID after v= or similar
    generic_match = re.search(r'(?:v=|\/embed\/|\/1\/|\/v\/|https?:\/\/youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})', url)
    if generic_match:
        return generic_match.group(1)
        
    return None


class VideoBase(BaseModel):
    """Base video fields."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    youtube_url: str = Field(..., min_length=1, max_length=500)
    category_name: Optional[str] = Field(None, max_length=100)
    is_published: bool = True

    @field_validator("title", "description", "category_name")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(v)
        return v

    @field_validator("youtube_url")
    @classmethod
    def validate_youtube_url(cls, v: str) -> str:
        yt_id = extract_youtube_id(v)
        if not yt_id:
            raise ValueError("رابط يوتيوب غير صالح. يرجى توفير رابط فيديو يوتيوب صحيح.")
        return v


class VideoCreate(VideoBase):
    """Schema for creating a new video."""
    pass


class VideoUpdate(BaseModel):
    """Schema for updating an existing video."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    youtube_url: Optional[str] = Field(None, min_length=1, max_length=500)
    category_name: Optional[str] = Field(None, max_length=100)
    is_published: Optional[bool] = None

    @field_validator("title", "description", "category_name")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(v)
        return v

    @field_validator("youtube_url")
    @classmethod
    def validate_youtube_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        yt_id = extract_youtube_id(v)
        if not yt_id:
            raise ValueError("رابط يوتيوب غير صالح. يرجى توفير رابط فيديو يوتيوب صحيح.")
        return v


class VideoResponse(VideoBase):
    """Video response schema."""
    id: int
    youtube_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
