"""
Rate Limiting Middleware
========================
Implements rate limiting using slowapi to prevent DDoS and spam.
Different limits for different endpoints.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse


# ─── Limiter Instance ─────────────────────────────────────────
# Uses client IP address as the rate limit key
limiter = Limiter(key_func=get_remote_address)


async def rate_limit_exceeded_handler(
    request: Request, exc: RateLimitExceeded
) -> JSONResponse:
    """
    Custom handler for rate limit exceeded errors.
    Returns a user-friendly Arabic error message.
    """
    return JSONResponse(
        status_code=429,
        content={
            "detail": "لقد تجاوزت الحد المسموح به من الطلبات. يرجى المحاولة لاحقاً.",
            "error": "rate_limit_exceeded",
            "retry_after": str(exc.detail),
        },
    )
