"""Pydantic schemas for Fatwas (Q&A)."""

from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional
from datetime import datetime
from app.security.sanitizer import sanitize_text
from app.models.fatwa import FatwaStatus


class FatwaSubmit(BaseModel):
    """
    Schema for public fatwa submission.
    Strictly validated and sanitized to prevent injection attacks.
    """
    question: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="السؤال (10-5000 حرف)",
    )
    questioner_name: Optional[str] = Field(
        default="مجهول",
        max_length=100,
        description="اسم السائل (اختياري)",
    )
    questioner_email: Optional[str] = Field(
        None,
        max_length=255,
        description="البريد الإلكتروني (اختياري)",
    )
    topic: Optional[str] = Field(
        None,
        max_length=100,
        description="موضوع السؤال",
    )
    is_private: bool = Field(
        default=False,
        description="سؤال خاص لا ينشر على الموقع",
    )
    notification_method: str = Field(
        default="none",
        description="طريقة الإجابة والتنبيه (none, email, whatsapp)",
    )
    questioner_whatsapp: Optional[str] = Field(
        None,
        max_length=50,
        description="رقم الواتساب (اختياري)",
    )

    @field_validator("question", "questioner_name", "topic", "questioner_whatsapp")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        """Strip ALL HTML/JS from user inputs."""
        if v is not None:
            return sanitize_text(v)
        return v

    @field_validator("questioner_email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Basic email validation if provided."""
        if v is not None and v.strip():
            v = sanitize_text(v)
            if "@" not in v or "." not in v:
                raise ValueError("البريد الإلكتروني غير صالح")
        return v


class FatwaAnswer(BaseModel):
    """Schema for admin answering a fatwa."""
    answer: str = Field(..., min_length=1, max_length=10000)
    status: FatwaStatus = FatwaStatus.APPROVED

    @field_validator("answer")
    @classmethod
    def sanitize_answer(cls, v: str) -> str:
        # Admin answers can contain basic formatting
        from app.security.sanitizer import sanitize_html
        return sanitize_html(v)


class FatwaResponse(BaseModel):
    """Fatwa response for public display."""
    id: int
    question: str
    questioner_name: Optional[str] = "مجهول"
    topic: Optional[str] = None
    answer: Optional[str] = None
    status: str
    is_private: bool = False
    ticket_code: Optional[str] = None
    created_at: Optional[datetime] = None
    answered_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FatwaAdminResponse(FatwaResponse):
    """Extended fatwa response for admin dashboard."""
    questioner_email: Optional[str] = None
    questioner_whatsapp: Optional[str] = None
    notification_method: str = "none"
    is_answered_and_sent: bool = False
    submitter_ip: Optional[str] = None
    answered_by: Optional[str] = None
    updated_at: Optional[datetime] = None
