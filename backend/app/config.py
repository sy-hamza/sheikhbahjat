"""
Application Configuration
========================
Centralized settings management using Pydantic Settings.
All sensitive values are loaded from environment variables or .env file.
"""

from pydantic_settings import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    """Application settings with secure defaults."""

    # ─── Application ───────────────────────────────────────────
    APP_NAME: str = "موقع الشيخ عامر بهجت"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ─── Database ──────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./sheikh_bahjat.db"

    # ─── JWT Authentication ────────────────────────────────────
    # CRITICAL: Change this in production via environment variable
    SECRET_KEY: str = secrets.token_urlsafe(64)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── CORS Configuration ───────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    EXTRA_CORS_ORIGINS: str = ""  # comma-separated extra origins (e.g. Vercel URL)

    # ─── Rate Limiting ─────────────────────────────────────────
    RATE_LIMIT_DEFAULT: str = "60/minute"  # General API rate limit
    RATE_LIMIT_FATWA_SUBMIT: str = "5/hour"  # Strict limit for Q&A submissions
    RATE_LIMIT_AUTH: str = "10/minute"  # Login attempts

    # ─── Security ──────────────────────────────────────────────
    CSRF_SECRET: str = secrets.token_urlsafe(32)
    COOKIE_SECURE: bool = False  # Set True in production (HTTPS)
    COOKIE_HTTPONLY: bool = True
    COOKIE_SAMESITE: str = "lax"

    # ─── File Upload & Cloud Storage ───────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_PDF_EXTENSIONS: List[str] = [".pdf"]
    ALLOWED_AUDIO_EXTENSIONS: List[str] = [".mp3", ".wav", ".ogg"]
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp"]
    UPLOAD_DIR: str = "./uploads"

    # Cloud Storage (S3-compatible / Supabase)
    # Provider: "supabase", "s3", or "local" (for fallback/testing)
    STORAGE_PROVIDER: str = "supabase"
    STORAGE_BUCKET: str = "sheikh-bahjat-archive"
    STORAGE_ENDPOINT_URL: str = ""  # e.g., https://[project-id].supabase.co/storage/v1/s3
    STORAGE_ACCESS_KEY_ID: str = ""
    STORAGE_SECRET_ACCESS_KEY: str = ""
    STORAGE_REGION: str = "us-east-1"

    # ─── R2 Media Proxy ────────────────────────────────────────
    # When R2_ENDPOINT is set, /uploads/{filename} is streamed from the
    # Cloudflare R2 bucket instead of the local disk. Lets the backend serve
    # media over its own HTTPS domain (avoids relying on the r2.dev URL).
    R2_ENDPOINT: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET: str = ""

    # ─── SMTP Email Notifications ──────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@bahjat.com"
    SMTP_FROM_NAME: str = "موقع الشيخ عامر بهجت"

    # ─── WhatsApp Notifications ────────────────────────────────
    WHATSAPP_API_URL: str = ""
    WHATSAPP_TOKEN: str = ""

    # Maximum file size configurations (in bytes)
    MAX_PDF_SIZE_BYTES: int = 50 * 1024 * 1024       # 50MB
    MAX_AUDIO_SIZE_BYTES: int = 100 * 1024 * 1024    # 100MB
    MAX_IMAGE_SIZE_BYTES: int = 5 * 1024 * 1024       # 5MB

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()
