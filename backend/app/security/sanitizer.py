"""
Input Sanitization
==================
Sanitizes all user inputs to prevent XSS and injection attacks.
Uses the 'bleach' library to clean HTML and JavaScript.
"""

import re
import bleach


# Allowed HTML tags (very restrictive - mainly for formatted fatwa answers)
ALLOWED_TAGS = [
    "p", "br", "strong", "em", "ul", "ol", "li",
    "h2", "h3", "h4", "blockquote",
]

ALLOWED_ATTRIBUTES = {}

# Compiled regex for stripping dangerous patterns
SCRIPT_PATTERN = re.compile(r"<script[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
EVENT_HANDLER_PATTERN = re.compile(r"\bon\w+\s*=", re.IGNORECASE)
JAVASCRIPT_URI_PATTERN = re.compile(r"javascript\s*:", re.IGNORECASE)


def sanitize_text(text: str) -> str:
    """
    Sanitize plain text input by stripping ALL HTML tags.
    Use for user-submitted questions, names, etc.
    
    Args:
        text: Raw user input.
    
    Returns:
        Clean text with all HTML removed.
    """
    if not text:
        return text

    # Strip all HTML tags
    cleaned = bleach.clean(text, tags=[], strip=True)

    # Remove any remaining dangerous patterns
    cleaned = SCRIPT_PATTERN.sub("", cleaned)
    cleaned = EVENT_HANDLER_PATTERN.sub("", cleaned)
    cleaned = JAVASCRIPT_URI_PATTERN.sub("", cleaned)

    # Trim whitespace
    return cleaned.strip()


def sanitize_html(html: str) -> str:
    """
    Sanitize HTML content while preserving allowed formatting tags.
    Use for admin-created content like fatwa answers.
    
    Args:
        html: Raw HTML content.
    
    Returns:
        Sanitized HTML with only allowed tags.
    """
    if not html:
        return html

    # Remove script tags and event handlers first
    cleaned = SCRIPT_PATTERN.sub("", html)
    cleaned = EVENT_HANDLER_PATTERN.sub("", cleaned)
    cleaned = JAVASCRIPT_URI_PATTERN.sub("", cleaned)

    # Use bleach to allow only safe tags
    cleaned = bleach.clean(
        cleaned,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True,
    )

    return cleaned.strip()


def sanitize_search_query(query: str) -> str:
    """
    Sanitize search queries - strip HTML and limit length.
    
    Args:
        query: Raw search query from user.
    
    Returns:
        Clean search query.
    """
    if not query:
        return query

    # Strip all HTML
    cleaned = bleach.clean(query, tags=[], strip=True)

    # Limit length to prevent abuse
    cleaned = cleaned[:200]

    return cleaned.strip()
