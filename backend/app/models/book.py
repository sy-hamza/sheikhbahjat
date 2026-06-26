"""
Book Model
==========
Books and booklets in the digital archive.
Each book belongs to a category and has a PDF file and cover image.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(300), nullable=False, index=True)
    author = Column(String(200), nullable=False, default="الشيخ عامر بهجت")
    description = Column(Text, nullable=True)

    # Public absolute URLs returned by the cloud storage provider (Supabase/S3)
    cover_image = Column(String(500), nullable=True)  # Public URL of the cover image
    pdf_path = Column(String(500), nullable=True)  # Public URL of the PDF book file

    # Metadata
    page_count = Column(Integer, nullable=True)
    publish_year = Column(String(10), nullable=True)
    isbn = Column(String(20), nullable=True)

    # Status
    is_published = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    download_count = Column(Integer, default=0)

    # Category relationship
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    category = relationship("Category", back_populates="books")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Book(id={self.id}, title='{self.title}')>"
