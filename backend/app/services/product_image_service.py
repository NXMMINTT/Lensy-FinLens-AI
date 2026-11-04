"""Product photos, stored as files under settings.upload_dir/products/<product_id>.<ext>
(same folder as LINE slip images, so no schema change). One photo per product."""

from pathlib import Path

from app.core.settings import settings

MAX_BYTES = 5 * 1024 * 1024

# Recognised by the file's first bytes, not by what the client claims.
_SIGNATURES: list[tuple[bytes, str]] = [
    (b"\xff\xd8\xff", ".jpg"),
    (b"\x89PNG\r\n\x1a\n", ".png"),
]
MEDIA_TYPES = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


class InvalidImageError(Exception):
    pass


def _folder() -> Path:
    return settings.upload_dir / "products"


def _extension(data: bytes) -> str:
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    for signature, extension in _SIGNATURES:
        if data.startswith(signature):
            return extension
    raise InvalidImageError("รองรับเฉพาะรูป JPG, PNG หรือ WebP")


def image_path(product_id: int) -> Path | None:
    folder = _folder()
    if not folder.is_dir():
        return None
    return next((p for p in folder.glob(f"{product_id}.*") if p.suffix in MEDIA_TYPES), None)


def image_url(product_id: int) -> str | None:
    """Public URL for <img>, versioned by modification time so a new photo isn't served from cache."""
    path = image_path(product_id)
    return f"/api/v1/products/{product_id}/image?v={int(path.stat().st_mtime)}" if path else None


def save_image(product_id: int, data: bytes) -> None:
    if not data:
        raise InvalidImageError("ไม่พบไฟล์รูป")
    if len(data) > MAX_BYTES:
        raise InvalidImageError("รูปใหญ่เกิน 5 MB")
    extension = _extension(data)
    delete_image(product_id)
    _folder().mkdir(parents=True, exist_ok=True)
    (_folder() / f"{product_id}{extension}").write_bytes(data)


def delete_image(product_id: int) -> None:
    path = image_path(product_id)
    if path is not None:
        path.unlink(missing_ok=True)
