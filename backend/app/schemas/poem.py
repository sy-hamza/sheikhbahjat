"""Pydantic schemas for Poems (Manzumat)."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.security.sanitizer import sanitize_text


class PoemBase(BaseModel):
    """Base poem fields."""
    title: str = Field(..., min_length=1, max_length=300)
    author: str = Field(default="الشيخ عامر بهجت", max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    text_content: str = Field(..., min_length=1)
    category_id: Optional[int] = None
    audio_path: Optional[str] = Field(None, max_length=500)
    verse_count: Optional[int] = Field(None, ge=1)
    subject: Optional[str] = Field(None, max_length=200)
    is_published: bool = True
    is_featured: bool = False

    @field_validator("title", "author", "description", "subject", "audio_path")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(v)
        return v


class PoemCreate(PoemBase):
    """Schema for creating a new poem."""
    pass


class PoemUpdate(BaseModel):
    """Schema for updating a poem."""
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    author: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    text_content: Optional[str] = Field(None, min_length=1)
    category_id: Optional[int] = None
    audio_path: Optional[str] = Field(None, max_length=500)
    verse_count: Optional[int] = Field(None, ge=1)
    subject: Optional[str] = Field(None, max_length=200)
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None

    @field_validator("title", "author", "description", "subject", "audio_path")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(v)
        return v


class PoemResponse(PoemBase):
    """Poem response with all fields."""
    id: int
    audio_path: Optional[str] = None
    created_at: Optional[datetime] = None
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
