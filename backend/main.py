"""
FastAPI application entry point.
- Registers routers for /api/sites and /api/leads
- Mounts /uploads as a static directory for uploaded images
- Configures CORS for the Next.js frontend
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import engine, Base
from . import models
from .routers import sites, leads, condition_reports, documentation


# Create all tables
# Includes heritage_sites, heritage_leads, site_images,
# and condition_reports from the SQLAlchemy models.
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="LokVirasat API",
    description="Heritage Sites & Leads backend for LokVirasat",
    version="1.0.0",
)


# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Static file serving for uploaded images ───────────────────────────────────

uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(uploads_path)),
    name="uploads",
)


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(sites.router)
app.include_router(leads.router)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}

app.include_router(sites.router)
app.include_router(leads.router)
app.include_router(documentation.router)
app.include_router(condition_reports.router)