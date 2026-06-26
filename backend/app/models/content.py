"""
Site Content Model
==================
Dynamic key-value content store for the website.
Used for hero section text, about page, biography, etc.
Allows admins to update content without code changes.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class SiteContent(Base):
    __tablename__ = "site_content"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Unique key to identify the content piece (e.g., 'hero_title', 'bio_text')
    key = Column(String(100), unique=True, nullable=False, index=True)

    # The actual content value
    value = Column(Text, nullable=False)

    # Content type hint for the frontend ('text', 'html', 'markdown', 'image_url')
    content_type = Column(String(20), nullable=False, default="text")

    # Optional grouping (e.g., 'home', 'about', 'footer')
    section = Column(String(50), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<SiteContent(key='{self.key}', section='{self.section}')>"
