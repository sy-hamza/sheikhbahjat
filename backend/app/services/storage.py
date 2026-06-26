"""
Cloud Storage Service
=====================
Handles uploading files to AWS S3 or Supabase Storage using boto3.
Uses streaming (upload_fileobj) to send files directly from client uploads to
the cloud bucket without saving them temporarily on local disk.
"""

import os
import uuid
import anyio
import boto3
from urllib.parse import urlparse
from botocore.config import Config
from fastapi import UploadFile, HTTPException

from app.config import settings


class StorageService:
    """Service to handle cloud uploads via boto3 for S3-compatible backends."""

    def __init__(self):
        self.provider = settings.STORAGE_PROVIDER.lower()
        self.bucket = settings.STORAGE_BUCKET
        self.client = None

        # If provider is "local", we use local storage fallback (for testing/development)
        if self.provider == "local":
            return

        try:
            session_kwargs = {}
            if settings.STORAGE_ACCESS_KEY_ID:
                session_kwargs["aws_access_key_id"] = settings.STORAGE_ACCESS_KEY_ID
            if settings.STORAGE_SECRET_ACCESS_KEY:
                session_kwargs["aws_secret_access_key"] = settings.STORAGE_SECRET_ACCESS_KEY

            client_kwargs = {
                "region_name": settings.STORAGE_REGION,
            }
            if settings.STORAGE_ENDPOINT_URL:
                client_kwargs["endpoint_url"] = settings.STORAGE_ENDPOINT_URL

            # Config to handle path addressing style for Supabase and other compatible APIs
            s3_config = Config(
                s3={"addressing_style": "path"},
                signature_version="s3v4"
            )

            self.client = boto3.client(
                "s3",
                config=s3_config,
                **session_kwargs,
                **client_kwargs
            )
        except Exception as e:
            # Log initialization warning but do not crash startup
            print(f"⚠️ Warning: Failed to initialize cloud storage client: {e}")

    async def upload_file_stream(self, file: UploadFile, folder: str) -> str:
        """
        Stream upload file from memory directly to cloud storage.
        Does NOT write file to the local disk.

        Args:
            file: The UploadFile object from FastAPI.
            folder: The target folder prefix in the bucket (e.g. "books" or "audio").

        Returns:
            The public URL of the uploaded file.
        """
        # Local Fallback
        if self.provider == "local":
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            ext = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

            try:
                # Write file in chunks to local disk
                await file.seek(0)
                with open(file_path, "wb") as buffer:
                    while chunk := await file.read(1024 * 1024):  # 1MB chunks
                        buffer.write(chunk)
                
                # Return local static path
                return f"/uploads/{unique_filename}"
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"فشل حفظ الملف محلياً: {str(e)}"
                )

        if not self.client:
            raise HTTPException(
                status_code=500,
                detail="خدمة التخزين السحابي غير متصلة أو غير مهيأة بشكل صحيح"
            )

        # Generate unique sanitized filename
        ext = os.path.splitext(file.filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{ext}"
        
        # KEY in S3 bucket (e.g., books/f9b7c8...pdf)
        clean_folder = folder.strip("/")
        key = f"{clean_folder}/{unique_filename}" if clean_folder else unique_filename

        try:
            extra_args = {}
            if file.content_type:
                extra_args["ContentType"] = file.content_type

            # Reset pointer to start of file
            await file.seek(0)

            # Upload directly via executive thread pool to avoid blocking async event loop
            await anyio.to_thread.run_sync(
                lambda: self.client.upload_fileobj(
                    file.file,
                    self.bucket,
                    key,
                    ExtraArgs=extra_args
                )
            )

            # Construct and return the public URL
            return self._get_public_url(key)

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"خطأ أثناء نقل الملف للتخزين السحابي: {str(e)}"
            )

    def _get_public_url(self, key: str) -> str:
        """Construct the absolute public URL of the uploaded S3 object."""
        if self.provider == "supabase" and settings.STORAGE_ENDPOINT_URL:
            # Supabase Storage S3 endpoints format:
            # https://[project-id].supabase.co/storage/v1/s3
            # Public asset download URLs format:
            # https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[key]
            parsed = urlparse(settings.STORAGE_ENDPOINT_URL)
            project_domain = parsed.netloc
            scheme = parsed.scheme
            return f"{scheme}://{project_domain}/storage/v1/object/public/{self.bucket}/{key}"

        if settings.STORAGE_ENDPOINT_URL:
            # Custom endpoint (Cloudflare R2, MinIO, etc.)
            endpoint = settings.STORAGE_ENDPOINT_URL.rstrip("/")
            return f"{endpoint}/{self.bucket}/{key}"

        # Standard AWS S3 Public URL
        return f"https://{self.bucket}.s3.{settings.STORAGE_REGION}.amazonaws.com/{key}"


# Initialize global storage service
storage_service = StorageService()
