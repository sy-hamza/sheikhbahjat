"""
Poem (Manzuma) Model
====================
Islamic poems/manzumat with text content and audio recitation.
Supports the split-view UI where users read verses and listen simultaneously.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Poem(Base):
    __tablename__ = "poems"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(300), nullable=False, index=True)
    author = Column(String(200), nullable=False, default="الشيخ عامر بهجت")
    description = Column(Text, nullable=True)

    # The full text of the poem (verses)
    text_content = Column(Text, nullable=False)

    # Public absolute URL returned by the cloud storage provider (Supabase/S3)
    audio_path = Column(String(500), nullable=True)

    # Metadata
    verse_count = Column(Integer, nullable=True)  # Number of verses/lines
    subject = Column(String(200), nullable=True)  # e.g., "العقيدة", "النحو"

    # Status
    is_published = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

    # Category relationship
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    category = relationship("Category", back_populates="poems")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Poem(id={self.id}, title='{self.title}')>"
