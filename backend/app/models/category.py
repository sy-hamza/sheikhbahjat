"""
Category Model
===============
Hierarchical (self-referencing) categories for the digital archive.
Supports nested folder structure: Fiqh > Usul al-Fiqh > Sub-topic.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    name_en = Column(String(200), nullable=True)  # Optional English name
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Icon identifier (e.g., 'book', 'scroll')
    sort_order = Column(Integer, default=0)  # For custom ordering

    # Self-referencing foreign key for hierarchy
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # ─── Relationships ─────────────────────────────────────────
    # Parent category (many-to-one)
    parent = relationship(
        "Category",
        remote_side="Category.id",
        back_populates="children",
    )

    # Children categories (sub-folders)
    children = relationship(
        "Category",
        back_populates="parent",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    # Books in this category
    books = relationship("Book", back_populates="category", lazy="selectin")

    # Poems in this category
    poems = relationship("Poem", back_populates="category", lazy="selectin")

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}', parent_id={self.parent_id})>"
