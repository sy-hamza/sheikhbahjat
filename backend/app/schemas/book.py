"""Pydantic schemas for Books and Booklets."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.security.sanitizer import sanitize_text


class BookBase(BaseModel):
    """Base book fields."""
    title: str = Field(..., min_length=1, max_length=300)
    author: str = Field(default="الشيخ عامر بهجت", max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category_id: Optional[int] = None
    page_count: Optional[int] = Field(None, ge=1)
    publish_year: Optional[str] = Field(None, max_length=10)
    is_published: bool = True
    is_featured: bool = False
    cover_image: Optional[str] = Field(None, max_length=500)
    pdf_path: Optional[str] = Field(None, max_length=500)

    @field_validator("title", "author", "description", "cover_image", "pdf_path")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(v)
        return v


class BookCreate(BookBase):
    """Schema for creating a new book."""
    pass


class BookUpdate(BaseModel):
    """Schema for updating a book."""
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    author: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category_id: Optional[int] = None
    page_count: Optional[int] = Field(None, ge=1)
    publish_year: Optional[str] = Field(None, max_length=10)
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    cover_image: Optional[str] = Field(None, max_length=500)
    pdf_path: Optional[str] = Field(None, max_length=500)

    @field_validator("title", "author", "description", "cover_image", "pdf_path")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(v)
        return v


class BookResponse(BookBase):
    """Book response with all fields."""
    id: int
    download_count: int = 0
    created_at: Optional[datetime] = None
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
