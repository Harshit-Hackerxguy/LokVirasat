"""
Routes for Heritage Sites.
Endpoints:
  GET    /api/sites           – list all sites
  GET    /api/sites/{id}      – get a single site
  POST   /api/sites           – create a new site
  DELETE /api/sites/{id}      – delete a site
  POST   /api/sites/{id}/images – upload an image for a site
"""

import os
import uuid
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/api/sites", tags=["Heritage Sites"])

UPLOAD_ROOT = Path(settings.UPLOAD_DIR)


# ---------------------------------------------------------------------------
# List / Get
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[schemas.HeritageSiteOut])
def list_sites(db: Session = Depends(get_db)):
    """Return all documented heritage sites."""
    return crud.get_sites(db)


@router.get("/{site_id}", response_model=schemas.HeritageSiteOut)
def get_site(site_id: str, db: Session = Depends(get_db)):
    site = crud.get_site(db, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


# ---------------------------------------------------------------------------
# Create / Delete
# ---------------------------------------------------------------------------

@router.post("/", response_model=schemas.HeritageSiteOut, status_code=201)
def create_site(payload: schemas.HeritageSiteCreate, db: Session = Depends(get_db)):
    existing = crud.get_site(db, payload.id)
    if existing:
        raise HTTPException(status_code=409, detail="A site with this id already exists")
    return crud.create_site(db, payload)


@router.delete("/{site_id}", status_code=204)
def delete_site(site_id: str, db: Session = Depends(get_db)):
    deleted = crud.delete_site(db, site_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Site not found")


# ---------------------------------------------------------------------------
# Image Upload
# ---------------------------------------------------------------------------

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 10


@router.post("/{site_id}/images", response_model=schemas.ImageOut, status_code=201)
async def upload_image(
    site_id: str,
    file: UploadFile = File(...),
    caption: str = Form(None),
    db: Session = Depends(get_db),
):
    site = crud.get_site(db, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are allowed")

    # Stream to disk, checking size
    site_dir = UPLOAD_ROOT / site_id
    site_dir.mkdir(parents=True, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    dest = site_dir / filename

    size = 0
    with open(dest, "wb") as f:
        while chunk := await file.read(1024 * 256):  # 256 KB chunks
            size += len(chunk)
            if size > MAX_SIZE_MB * 1024 * 1024:
                f.close()
                dest.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail=f"Image exceeds {MAX_SIZE_MB} MB limit")
            f.write(chunk)

    # URL relative to static mount (/uploads/<site_id>/<filename>)
    url = f"/uploads/{site_id}/{filename}"
    image = crud.add_image_to_site(db, site_id=site_id, url=url, caption=caption)
    return image
