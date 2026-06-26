"""
Books Router
============
CRUD operations for books and booklets in the digital archive.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.book import Book
from app.models.category import Category
from app.models.user import User
from app.schemas.book import BookCreate, BookUpdate, BookResponse
from app.security.auth import require_admin, get_current_user
from app.security.sanitizer import sanitize_search_query

router = APIRouter(prefix="/api/books", tags=["Books"])


def _book_to_response(book: Book) -> dict:
    """Convert book model to response dict with category name."""
    data = {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "description": book.description,
        "cover_image": book.cover_image,
        "pdf_path": book.pdf_path,
        "page_count": book.page_count,
        "publish_year": book.publish_year,
        "is_published": book.is_published,
        "is_featured": book.is_featured,
        "download_count": book.download_count,
        "category_id": book.category_id,
        "category_name": book.category.name if book.category else None,
        "created_at": book.created_at,
    }
    return data


@router.get("/", response_model=List[BookResponse])
async def get_books(
    request: Request,
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None, max_length=200),
    featured: Optional[bool] = Query(None),
    include_unpublished: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Get books with optional filtering, search, and pagination."""
    if include_unpublished:
        user = await get_current_user(request, db)
        if user.role != "admin":
            raise HTTPException(status_code=403, detail="هذا الإجراء يتطلب صلاحيات المدير")
        query = db.query(Book)
    else:
        query = db.query(Book).filter(Book.is_published == True)

    if category_id:
        query = query.filter(Book.category_id == category_id)
    if featured is not None:
        query = query.filter(Book.is_featured == featured)
    if search:
        clean_search = sanitize_search_query(search)
        query = query.filter(Book.title.ilike(f"%{clean_search}%"))

    books = query.order_by(desc(Book.created_at)).offset(skip).limit(limit).all()
    return [_book_to_response(b) for b in books]


@router.get("/latest", response_model=List[BookResponse])
async def get_latest_books(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Get the most recently added books."""
    books = (
        db.query(Book)
        .filter(Book.is_published == True)
        .order_by(desc(Book.created_at))
        .limit(limit)
        .all()
    )
    return [_book_to_response(b) for b in books]


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: int, db: Session = Depends(get_db)):
    """Get a single book by ID."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="الكتاب غير موجود")
    return _book_to_response(book)


@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    data: BookCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new book (admin only)."""
    book = Book(**data.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return _book_to_response(book)


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    data: BookUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a book (admin only)."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="الكتاب غير موجود")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(book, field, value)

    db.commit()
    db.refresh(book)
    return _book_to_response(book)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a book (admin only)."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="الكتاب غير موجود")
    db.delete(book)
    db.commit()
