"""
FastAPI Application Entry Point
================================
Sheikh Amer Bahjat Digital Archive - Backend API.

This module initializes the FastAPI application with:
- All security middleware (CORS, security headers, rate limiting)
- All API routers
- Database initialization
- Static file serving for uploads
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import engine, Base
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.rate_limiter import limiter, rate_limit_exceeded_handler

# Import all models so SQLAlchemy discovers them
from app.models import User, Category, Book, Poem, Fatwa, SiteContent, Video

# Import routers
from app.routers import auth, categories, books, poems, fatwas, content, upload, videos


# ─── Application Factory ──────────────────────────────────────
def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="الموقع الرسمي والأرشيف الرقمي للشيخ عامر بهجت",
        docs_url="/api/docs" if settings.DEBUG else None,
        redoc_url="/api/redoc" if settings.DEBUG else None,
    )

    # ─── Rate Limiter ──────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

    # ─── CORS Middleware ───────────────────────────────────
    cors_origins = list(settings.CORS_ORIGINS)
    if settings.EXTRA_CORS_ORIGINS:
        cors_origins += [o.strip() for o in settings.EXTRA_CORS_ORIGINS.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
        expose_headers=["X-CSRF-Token"],
    )

    # ─── Security Headers ─────────────────────────────────
    app.add_middleware(SecurityHeadersMiddleware)

    # ─── Register Routers ─────────────────────────────────
    app.include_router(auth.router)
    app.include_router(categories.router)
    app.include_router(books.router)
    app.include_router(poems.router)
    app.include_router(fatwas.router)
    app.include_router(content.router)
    app.include_router(upload.router)
    app.include_router(videos.router)

    # ─── Media serving (uploads) ──────────────────────────
    # If R2 is configured, stream files from the bucket via a router.
    # Otherwise serve from the local disk (development).
    if settings.R2_ENDPOINT and settings.R2_ACCESS_KEY_ID:
        from app.routers import files as files_router
        app.include_router(files_router.router)
    else:
        uploads_dir = settings.UPLOAD_DIR
        os.makedirs(uploads_dir, exist_ok=True)
        app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # ─── Startup Event ────────────────────────────────────
    @app.on_event("startup")
    async def startup():
        """Create database tables on startup."""
        Base.metadata.create_all(bind=engine)
        print(f"✅ {settings.APP_NAME} - API started successfully")
        print(f"📚 Database tables created/verified")

    # ─── Health Check ─────────────────────────────────────
    @app.get("/api/health", tags=["Health"])
    async def health_check():
        """Simple health check endpoint."""
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }

    # ─── Dashboard Stats ─────────────────────────────────
    @app.get("/api/stats", tags=["Stats"])
    async def get_public_stats():
        """Get public statistics for the homepage."""
        from sqlalchemy.orm import Session
        from app.database import SessionLocal
        from app.models.fatwa import FatwaStatus

        db = SessionLocal()
        try:
            return {
                "books": db.query(Book).filter(Book.is_published == True).count(),
                "poems": db.query(Poem).filter(Poem.is_published == True).count(),
                "fatwas": db.query(Fatwa).filter(Fatwa.status == FatwaStatus.APPROVED).count(),
                "categories": db.query(Category).count(),
            }
        finally:
            db.close()

    return app


# Create the app instance
app = create_app()


# ─── Run with Uvicorn ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
