"""
CRUD helpers – thin layer between routers and the database.
"""

from __future__ import annotations
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
from . import models, schemas

# ---------------------------------------------------------------------------
# Heritage Sites
# ---------------------------------------------------------------------------

def get_sites(db: Session) -> list[models.HeritageSite]:
    return db.query(models.HeritageSite).all()

def get_site(db: Session, site_id: str) -> models.HeritageSite | None:
    return db.query(models.HeritageSite).filter(models.HeritageSite.id == site_id).first()

def create_site(db: Session, payload: schemas.HeritageSiteCreate) -> models.HeritageSite:
    point = WKTElement(
        f"POINT({payload.longitude} {payload.latitude})", srid=4326
    )
    site = models.HeritageSite(
        id=payload.id,
        name=payload.name,
        description=payload.description,
        category=payload.category,
        location=point,
        zoom_level=payload.zoom_level,
        pitch=payload.pitch,
        bearing=payload.bearing,
        verification_status=payload.verification_status,
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return site

def delete_site(db: Session, site_id: str) -> bool:
    site = get_site(db, site_id)
    if not site:
        return False
    db.delete(site)
    db.commit()
    return True

# ---------------------------------------------------------------------------
# Site Images
# ---------------------------------------------------------------------------

def add_image_to_site(db: Session, site_id: str, url: str, caption: str | None = None) -> models.SiteImage:
    img = models.SiteImage(site_id=site_id, url=url, caption=caption)
    db.add(img)
    db.commit()
    db.refresh(img)
    return img

# ---------------------------------------------------------------------------
# Heritage Leads
# ---------------------------------------------------------------------------

def get_leads(db: Session) -> list[models.HeritageLead]:
    return db.query(models.HeritageLead).all()


def get_lead(db: Session, lead_id: str) -> models.HeritageLead | None:
    return db.query(models.HeritageLead).filter(models.HeritageLead.id == lead_id).first()


def create_lead(db: Session, payload: schemas.HeritageLeadCreate) -> models.HeritageLead:
    point = WKTElement(
        f"POINT({payload.longitude} {payload.latitude})", srid=4326
    )
    lead = models.HeritageLead(
        id=payload.id,
        name=payload.name,
        description=payload.description,
        category=payload.category,
        location=point,
        village_or_area=payload.village_or_area,
        submitted_by=payload.submitted_by,
        status=payload.status,
        assigned_contributor=payload.assigned_contributor,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def update_lead_status(db: Session, lead_id: str, status: models.LeadStatus, contributor: str | None = None) -> models.HeritageLead | None:
    lead = get_lead(db, lead_id)
    if not lead:
        return None
    lead.status = status
    if contributor:
        lead.assigned_contributor = contributor
    db.commit()
    db.refresh(lead)
    return lead

# ---------------------------------------------------------------------------
# Condition Reports
# ---------------------------------------------------------------------------

def create_condition_report(
    db: Session,
    payload: schemas.ConditionReportCreate,
):
    from geoalchemy2.shape import from_shape
    from shapely.geometry import Point
    from .models import ConditionReport, IssueType

    try:
        issue_type = IssueType(payload.issue_type)
    except ValueError:
        raise ValueError(
            f"Invalid issue type: {payload.issue_type}"
        )

    report = ConditionReport(
        id=payload.id,
        site_id=payload.site_id,
        issue_type=issue_type,
        photo_url=payload.photo_url,
        exif_location=from_shape(
            Point(
                payload.exif_longitude,
                payload.exif_latitude,
            ),
            srid=4326,
        ),
        verified=payload.verified,
        resolved=payload.resolved,
        description=payload.description,
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def resolve_condition_report(
    db: Session,
    report_id: str,
    resolved: bool,
):
    from .models import ConditionReport

    report = (
        db.query(ConditionReport)
        .filter(ConditionReport.id == report_id)
        .first()
    )

    if not report:
        return None

    report.resolved = resolved

    db.commit()
    db.refresh(report)

    return report

# ---------------------------------------------------------------------------
# Heritage Documentation
# ---------------------------------------------------------------------------


def create_documentation(
    db: Session,
    payload: schemas.HeritageDocumentationCreate
):
    documentation = models.HeritageDocumentation(
        id=payload.id,
        lead_id=payload.lead_id,
        contributor_id=payload.contributor_id,
        historical_information=
            payload.historical_information,
        cultural_significance=
            payload.cultural_significance,
        sources=payload.sources,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status=payload.status,
    )

    db.add(documentation)
    db.commit()
    db.refresh(documentation)

    return documentation


def get_documentation_by_lead(
    db: Session,
    lead_id: str
):

    return (
        db.query(models.HeritageDocumentation)
        .filter(
            models.HeritageDocumentation.lead_id == lead_id
        )
        .first()
    )