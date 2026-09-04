"""
Pydantic v2 schemas for request validation and API response serialisation.
Coordinates are always returned as [longitude, latitude] to match the
frontend's existing Coordinates type: [longitude: number, latitude: number].
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from .models import HeritageCategory, VerificationStatus, LeadStatus, DocumentationStatus


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

class ImageOut(BaseModel):
    id: int
    url: str
    caption: Optional[str] = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Heritage Sites
# ---------------------------------------------------------------------------

class HeritageSiteCreate(BaseModel):
    id: str = Field(..., description="URL-safe slug, e.g. 'ancient-well-rajasthan'")
    name: str
    description: str
    category: HeritageCategory
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)
    zoom_level: float = 15.0
    pitch: float = 45.0
    bearing: float = 0.0
    verification_status: VerificationStatus = VerificationStatus.reported


class HeritageSiteOut(BaseModel):
    id: str
    name: str
    description: str
    category: HeritageCategory
    coordinates: list[float]          # [longitude, latitude]
    zoom_level: float
    pitch: float
    bearing: float
    verification_status: VerificationStatus
    last_updated: Optional[datetime] = None
    images: list[str] = []            # list of image URLs (matches frontend)

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def extract_geometry(cls, data):
        """
        Convert the PostGIS geometry object into [lng, lat] before validation.
        Works with both ORM objects and plain dicts.
        """
        if hasattr(data, "__dict__"):
            # ORM object
            from geoalchemy2.shape import to_shape
            if data.location is not None:
                point = to_shape(data.location)
                data.__dict__["coordinates"] = [point.x, point.y]
            data.__dict__["images"] = [img.url for img in (data.images or [])]
        return data


# ---------------------------------------------------------------------------
# Heritage Leads
# ---------------------------------------------------------------------------

class HeritageLeadCreate(BaseModel):
    id: str
    name: str
    description: str
    category: HeritageCategory
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)
    village_or_area: str
    submitted_by: str
    status: LeadStatus = LeadStatus.needs_documentation
    assigned_contributor: Optional[str] = None


class HeritageLeadOut(BaseModel):
    id: str
    name: str
    description: str
    category: HeritageCategory
    approximate_location: list[float]   # [longitude, latitude]
    village_or_area: str
    submitted_by: str
    submitted_at: Optional[datetime] = None
    status: LeadStatus
    assigned_contributor: Optional[str] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def extract_geometry(cls, data):
        if hasattr(data, "__dict__"):
            from geoalchemy2.shape import to_shape
            if data.location is not None:
                point = to_shape(data.location)
                data.__dict__["approximate_location"] = [point.x, point.y]
        return data

# ---------------------------------------------------------------------------
# Condition Reports
# ---------------------------------------------------------------------------

class ConditionReportCreate(BaseModel):
    id: str
    site_id: str
    issue_type: str
    photo_url: str
    exif_longitude: float = Field(..., ge=-180, le=180)
    exif_latitude: float = Field(..., ge=-90, le=90)
    verified: bool = False
    resolved: bool = False
    description: str


class ConditionReportOut(BaseModel):
    id: str
    site_id: str
    issue_type: str
    photo_url: str
    exif_coordinates: list[float]   # [longitude, latitude]
    verified: bool
    resolved: bool
    description: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def extract_geometry(cls, data):
        if hasattr(data, "__dict__"):
            from geoalchemy2.shape import to_shape

            if data.exif_location is not None:
                point = to_shape(data.exif_location)
                data.__dict__["exif_coordinates"] = [
                    point.x,
                    point.y,
                ]

        return data

# ---------------------------------------------------------------------------
# Heritage Documentation
# ---------------------------------------------------------------------------

class HeritageDocumentationCreate(BaseModel):

    id: str

    lead_id: str

    contributor_id: str

    historical_information: str

    cultural_significance: str

    sources: str | None = None

    latitude: float

    longitude: float

    status: DocumentationStatus = (
        DocumentationStatus.submitted
    )


class HeritageDocumentationOut(BaseModel):

    id: str

    lead_id: str

    contributor_id: str

    historical_information: str

    cultural_significance: str

    sources: str | None

    latitude: float

    longitude: float

    status: DocumentationStatus

    created_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }