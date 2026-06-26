"""
Media File Proxy Router
=======================
Streams media files (PDFs, audio, images) from the Cloudflare R2 bucket
through the backend's own HTTPS domain.

Mounted at /uploads/{filename} so existing DB paths (/uploads/<uuid>.<ext>)
work unchanged. Only enabled when R2 credentials are configured; otherwise
main.py mounts local static files instead.
"""

import boto3
from botocore.config import Config
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import settings

router = APIRouter(prefix="/uploads", tags=["Files"])

_client = None

CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "s3",
            endpoint_url=settings.R2_ENDPOINT,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=Config(s3={"addressing_style": "path"}, signature_version="s3v4"),
            region_name="auto",
        )
    return _client


@router.get("/{filename}")
def get_file(filename: str):
    """Stream a single object from the R2 bucket by filename."""
    # filename is a single path segment (no slashes) → no path traversal
    try:
        obj = _get_client().get_object(Bucket=settings.R2_BUCKET, Key=filename)
    except Exception:
        raise HTTPException(status_code=404, detail="الملف غير موجود")

    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    media_type = obj.get("ContentType") or CONTENT_TYPES.get(ext, "application/octet-stream")

    headers = {"Cache-Control": "public, max-age=86400"}
    if obj.get("ContentLength") is not None:
        headers["Content-Length"] = str(obj["ContentLength"])

    return StreamingResponse(
        obj["Body"].iter_chunks(chunk_size=1024 * 256),
        media_type=media_type,
        headers=headers,
    )
