"""
CSRF Protection
===============
Double-submit cookie pattern for CSRF token validation.
Generates tokens and validates them on state-changing requests.
"""

import secrets
import hmac
from fastapi import HTTPException, Request, status
from app.config import settings


def generate_csrf_token() -> str:
    """Generate a cryptographically secure CSRF token."""
    return secrets.token_urlsafe(32)


def validate_csrf_token(request_token: str, cookie_token: str) -> bool:
    """
    Validate CSRF token using constant-time comparison to prevent timing attacks.
    
    Args:
        request_token: Token from the request header/body.
        cookie_token: Token from the HttpOnly cookie.
    
    Returns:
        True if tokens match.
    """
    if not request_token or not cookie_token:
        return False
    return hmac.compare_digest(request_token, cookie_token)


async def verify_csrf(request: Request) -> None:
    """
    FastAPI dependency that verifies CSRF token on state-changing requests.
    Compares the token from X-CSRF-Token header with the csrf_token cookie.
    
    Raises:
        HTTPException: If CSRF validation fails.
    """
    # Only validate on state-changing methods
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return

    cookie_token = request.cookies.get("csrf_token")
    header_token = request.headers.get("X-CSRF-Token")

    if not validate_csrf_token(header_token, cookie_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="فشل التحقق من رمز CSRF. يرجى تحديث الصفحة والمحاولة مرة أخرى.",
        )
