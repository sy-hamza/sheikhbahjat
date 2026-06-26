"""Models package - Import all models for SQLAlchemy to discover them."""

from app.models.user import User
from app.models.category import Category
from app.models.book import Book
from app.models.poem import Poem
from app.models.fatwa import Fatwa
from app.models.content import SiteContent
from app.models.video import Video

__all__ = ["User", "Category", "Book", "Poem", "Fatwa", "SiteContent", "Video"]
