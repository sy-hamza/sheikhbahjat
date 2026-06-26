from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Video(Base):
    """
    Video Model
    ===========
    Represents a video item (YouTube link) stored in the database.
    """
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(1000), nullable=True)
    youtube_url = Column(String(500), nullable=False)
    youtube_id = Column(String(100), nullable=False)
    category_name = Column(String(100), nullable=True)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Video(id={self.id}, title='{self.title}', youtube_id='{self.youtube_id}')>"
