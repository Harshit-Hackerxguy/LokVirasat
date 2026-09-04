"""
SQLAlchemy ORM models.
Two separate tables:
  - heritage_sites  (fully documented sites)
  - heritage_leads  (community-submitted tips needing documentation)

Both use PostGIS geometry columns for precise location storage.
"""

from sqlalchemy import (
    Column,
    String,
    Text,
    Enum as SAEnum,
    DateTime,
    ForeignKey,
    Integer,
    Float,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
import enum

from database import Base


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class HeritageCategory(str, enum.Enum):
    Monument = "Monument"
    SacredGrove = "Sacred Grove"
    FolkloreSite = "Folklore Site"
    AncientRuins = "Ancient Ruins"
    TraditionalCraftHub = "Traditional Craft Hub"


class VerificationStatus(str, enum.Enum):
    community_reported = "community-reported"
    community_corroborated = "community-corroborated"
    evidence_supported = "evidence-supported"
    authority_verified = "authority-verified"


class LeadStatus(str, enum.Enum):
    needs_documentation = "needs-documentation"
    claimed = "claimed"
    documented = "documented"
    verified = "verified"


class DocumentationStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    under_review = "under_review"
    verified = "verified"
    rejected = "rejected"


class IssueType(str, enum.Enum):
    Damage = "Damage"
    Cleanliness = "Cleanliness"
    Infrastructure = "Infrastructure"
    Accessibility = "Accessibility"


# ---------------------------------------------------------------------------
# Heritage Sites (fully documented records)
# ---------------------------------------------------------------------------

class HeritageSite(Base):
    __tablename__ = "heritage_sites"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SAEnum(HeritageCategory), nullable=False)

    # PostGIS geometry: POINT(longitude latitude), SRID 4326 (WGS84)
    location = Column(
        Geometry("POINT", srid=4326),
        nullable=False,
    )

    # Map camera settings
    zoom_level = Column(Float, default=15.0)
    pitch = Column(Float, default=45.0)
    bearing = Column(Float, default=0.0)

    verification_status = Column(
        SAEnum(VerificationStatus),
        default=VerificationStatus.community_reported,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    last_updated = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # One-to-many: a site can have multiple images
    images = relationship(
        "SiteImage",
        back_populates="site",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


# ---------------------------------------------------------------------------
# Site Images
# ---------------------------------------------------------------------------

class SiteImage(Base):
    __tablename__ = "site_images"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    site_id = Column(
        String,
        ForeignKey("heritage_sites.id", ondelete="CASCADE"),
        nullable=False,
    )

    url = Column(
        String(512),
        nullable=False,
    )

    caption = Column(
        String(255),
        nullable=True,
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    site = relationship(
        "HeritageSite",
        back_populates="images",
    )


# ---------------------------------------------------------------------------
# Heritage Leads (community-submitted tips)
# ---------------------------------------------------------------------------

class HeritageLead(Base):
    __tablename__ = "heritage_leads"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SAEnum(HeritageCategory), nullable=False)

    # Approximate location submitted by the community
    location = Column(
        Geometry("POINT", srid=4326),
        nullable=False,
    )

    village_or_area = Column(
        String(255),
        nullable=False,
    )

    submitted_by = Column(
        String(255),
        nullable=False,
    )

    submitted_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    status = Column(
        SAEnum(LeadStatus),
        default=LeadStatus.needs_documentation,
        nullable=False,
    )

    assigned_contributor = Column(
        String(255),
        nullable=True,
    )


# ---------------------------------------------------------------------------
# Heritage Documentation
# ---------------------------------------------------------------------------

class HeritageDocumentation(Base):
    __tablename__ = "heritage_documentation"

    id = Column(
        String,
        primary_key=True,
        index=True,
    )

    lead_id = Column(
        String,
        ForeignKey("heritage_leads.id"),
        nullable=False,
    )

    contributor_id = Column(
        String,
        nullable=False,
    )

    historical_information = Column(
        Text,
        nullable=False,
    )

    cultural_significance = Column(
        Text,
        nullable=False,
    )

    sources = Column(
        Text,
        nullable=True,
    )

    latitude = Column(
        Float,
        nullable=False,
    )

    longitude = Column(
        Float,
        nullable=False,
    )

    status = Column(
        SAEnum(DocumentationStatus),
        default=DocumentationStatus.submitted,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# ---------------------------------------------------------------------------
# Condition Reports (field reports from contributors)
# ---------------------------------------------------------------------------

class ConditionReport(Base):
    __tablename__ = "condition_reports"

    id = Column(
        String,
        primary_key=True,
        index=True,
    )

    site_id = Column(
        String,
        ForeignKey("heritage_sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    issue_type = Column(
        SAEnum(IssueType),
        nullable=False,
    )

    photo_url = Column(
        String(512),
        nullable=False,
    )

    exif_location = Column(
        Geometry("POINT", srid=4326),
        nullable=True,
    )

    verified = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    resolved = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    description = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )