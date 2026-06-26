"""
Security Headers Middleware
============================
Adds comprehensive security headers to all responses.
Equivalent to helmet.js for Node.js applications.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware that adds security-related HTTP headers to every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # ─── Clickjacking Protection ──────────────────────────
        # Prevent the site from being embedded in iframes
        response.headers["X-Frame-Options"] = "DENY"

        # ─── MIME Type Sniffing Protection ────────────────────
        # Prevent browsers from MIME-sniffing the content type
        response.headers["X-Content-Type-Options"] = "nosniff"

        # ─── XSS Protection ──────────────────────────────────
        # Enable browser's built-in XSS filter
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # ─── Referrer Policy ─────────────────────────────────
        # Control how much referrer info is sent
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # ─── Content Security Policy ─────────────────────────
        # Restrict resource loading to prevent XSS and data injection
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # Needed for Next.js
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "media-src 'self' blob:",
            "connect-src 'self' http://localhost:* http://127.0.0.1:*",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)

        # ─── HSTS (HTTP Strict Transport Security) ────────────
        # Force HTTPS connections (activate in production)
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

        # ─── Permissions Policy ──────────────────────────────
        # Restrict browser features
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=()"
        )

        return response
