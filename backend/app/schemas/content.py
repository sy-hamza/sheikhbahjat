"""Pydantic schemas for Site Content."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ContentUpdate(BaseModel):
    """Schema for updating site content."""
    value: str = Field(..., min_length=1, max_length=10000)
    content_type: str = Field(default="text", pattern=r"^(text|html|markdown|image_url)$")


class ContentResponse(BaseModel):
    """Site content response."""
    id: int
    key: str
    value: str
    content_type: str
    section: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
