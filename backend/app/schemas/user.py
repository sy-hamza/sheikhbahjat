"""Pydantic schemas for User authentication and management."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class LoginRequest(BaseModel):
    """Schema for admin login."""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("اسم المستخدم يجب أن يحتوي فقط على أحرف وأرقام")
        return v


class UserResponse(BaseModel):
    """Public user data returned in API responses."""
    id: int
    username: str
    email: str
    role: str
    display_name: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
