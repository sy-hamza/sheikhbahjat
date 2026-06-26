"""Pydantic schemas for Category (hierarchical archive folders)."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.security.sanitizer import sanitize_text


class CategoryBase(BaseModel):
    """Base category fields."""
    name: str = Field(..., min_length=1, max_length=200)
    name_en: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    icon: Optional[str] = Field(None, max_length=50)
    sort_order: int = Field(default=0, ge=0)
    parent_id: Optional[int] = None

    @field_validator("name", "description")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(v)
        return v


class CategoryCreate(CategoryBase):
    """Schema for creating a new category."""
    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    name_en: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    icon: Optional[str] = Field(None, max_length=50)
    sort_order: Optional[int] = Field(None, ge=0)
    parent_id: Optional[int] = None

    @field_validator("name", "description")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return sanitize_text(v)
        return v


class CategoryResponse(CategoryBase):
    """Category response with nested children."""
    id: int
    created_at: Optional[datetime] = None
    children: List["CategoryResponse"] = []
    book_count: int = 0
    poem_count: int = 0

    class Config:
        from_attributes = True


# Enable self-referencing
CategoryResponse.model_rebuild()
