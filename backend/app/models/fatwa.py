"""
Fatwa (Q&A) Model
=================
Questions submitted by users and answers provided by the Sheikh/moderators.
Implements a workflow: pending → approved/rejected → published.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, Boolean
from sqlalchemy.sql import func
from app.database import Base
import enum


class FatwaStatus(str, enum.Enum):
    """Status workflow for fatwa questions."""
    PENDING = "pending"        # Newly submitted, awaiting review
    APPROVED = "approved"      # Approved and answered, visible to public
    REJECTED = "rejected"      # Rejected (spam, inappropriate, duplicate)
    ARCHIVED = "archived"      # Archived (old but still accessible)


class Fatwa(Base):
    __tablename__ = "fatwas"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Question details
    question = Column(Text, nullable=False)
    questioner_name = Column(String(100), nullable=True, default="مجهول")  # Anonymous by default
    questioner_email = Column(String(255), nullable=True)  # Optional contact
    questioner_whatsapp = Column(String(50), nullable=True) # WhatsApp contact for private notifications
    topic = Column(String(100), nullable=True)  # e.g., "فقه", "عقيدة"

    # Privacy and Notification configuration
    is_private = Column(Boolean, default=False, nullable=False)
    notification_method = Column(String(50), default="none", nullable=False) # "none", "email", "whatsapp"
    is_answered_and_sent = Column(Boolean, default=False, nullable=False)
    ticket_code = Column(String(50), unique=True, nullable=True, index=True)

    # Answer (filled by admin/moderator)
    answer = Column(Text, nullable=True)
    answered_by = Column(String(100), nullable=True)  # Name of the answerer

    # Status workflow
    status = Column(
        Enum(FatwaStatus),
        nullable=False,
        default=FatwaStatus.PENDING,
        index=True,
    )

    # Security: store submitter IP for rate limiting and abuse tracking
    submitter_ip = Column(String(45), nullable=True)  # IPv6 max length

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    answered_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Fatwa(id={self.id}, status='{self.status}', topic='{self.topic}')>"
