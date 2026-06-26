"""
Upload Router
=============
API endpoints for securely uploading PDF books, cover images, and recitation audios.
Requires admin privileges and streams files directly to cloud storage.
"""

import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from app.config import settings
from app.models.user import User
from app.security.auth import require_admin
from app.services.storage import storage_service

router = APIRouter(prefix="/api/upload", tags=["Upload"])


def validate_file(file: UploadFile, allowed_extensions: list, max_size_bytes: int):
    """Helper to validate file extension and size before uploading."""
    # 1. Validate Extension
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="اسم الملف غير صالح"
        )
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        allowed_str = ", ".join(allowed_extensions)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"نوع الملف غير مسموح به. الامتدادات المدعومة: {allowed_str}"
        )

    # 2. Validate Size
    try:
        # Seek to end of file to read length
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)  # Reset pointer back to the beginning
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"خطأ أثناء التحقق من حجم الملف: {str(e)}"
        )

    if size > max_size_bytes:
        max_size_mb = int(max_size_bytes / (1024 * 1024))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"حجم الملف كبير جداً. الحد الأقصى المسموح به هو {max_size_mb} ميغابايت"
        )


@router.post("/pdf", response_model=dict)
async def upload_pdf(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin)
):
    """
    Upload a book/booklet PDF.
    Only PDF extensions are allowed. Max size is 50MB.
    """
    validate_file(file, settings.ALLOWED_PDF_EXTENSIONS, settings.MAX_PDF_SIZE_BYTES)
    url = await storage_service.upload_file_stream(file, folder="books")
    return {"url": url}


@router.post("/image", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin)
):
    """
    Upload a book cover image.
    Allowed extensions: .jpg, .jpeg, .png, .webp. Max size is 5MB.
    """
    validate_file(file, settings.ALLOWED_IMAGE_EXTENSIONS, settings.MAX_IMAGE_SIZE_BYTES)
    url = await storage_service.upload_file_stream(file, folder="covers")
    return {"url": url}


@router.post("/audio", response_model=dict)
async def upload_audio(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin)
):
    """
    Upload a Manzuma recitation audio file.
    Allowed extensions: .mp3, .wav, .ogg. Max size is 100MB.
    """
    validate_file(file, settings.ALLOWED_AUDIO_EXTENSIONS, settings.MAX_AUDIO_SIZE_BYTES)
    url = await storage_service.upload_file_stream(file, folder="audio")
    return {"url": url}
