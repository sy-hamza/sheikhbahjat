"""
Categories Router
=================
CRUD operations for the hierarchical archive category system.
Public: read operations. Admin: write operations.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.security.auth import require_admin

router = APIRouter(prefix="/api/categories", tags=["Categories"])


def _build_category_response(category: Category) -> dict:
    """Build a category response dict with computed fields."""
    return {
        "id": category.id,
        "name": category.name,
        "name_en": category.name_en,
        "description": category.description,
        "icon": category.icon,
        "sort_order": category.sort_order,
        "parent_id": category.parent_id,
        "created_at": category.created_at,
        "book_count": len(category.books) if category.books else 0,
        "poem_count": len(category.poems) if category.poems else 0,
        "children": [_build_category_response(child) for child in (category.children or [])],
    }


@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """
    Get the full category tree (root categories with nested children).
    Public endpoint - no authentication required.
    """
    # Fetch only root categories (no parent) - children are loaded via relationship
    root_categories = (
        db.query(Category)
        .filter(Category.parent_id.is_(None))
        .order_by(Category.sort_order, Category.name)
        .all()
    )
    return [_build_category_response(cat) for cat in root_categories]


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a single category by ID with its children."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="التصنيف غير موجود")
    return _build_category_response(category)


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new category (admin only)."""
    # Verify parent exists if specified
    if data.parent_id:
        parent = db.query(Category).filter(Category.id == data.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="التصنيف الأب غير موجود")

    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return _build_category_response(category)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a category (admin only)."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="التصنيف غير موجود")

    # Prevent circular reference
    if data.parent_id and data.parent_id == category_id:
        raise HTTPException(status_code=400, detail="لا يمكن أن يكون التصنيف أباً لنفسه")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return _build_category_response(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a category and all its children (admin only)."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="التصنيف غير موجود")

    db.delete(category)
    db.commit()
