"""
Routes for Heritage Leads.
Endpoints:
  GET   /api/leads              – list all leads
  GET   /api/leads/{id}         – get a single lead
  POST  /api/leads              – submit a new lead
  PATCH /api/leads/{id}/status  – update status (claim, verify, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from . import crud, schemas
from .database import get_db
from .models import LeadStatus

router = APIRouter(prefix="/api/leads", tags=["Heritage Leads"])


@router.get("/", response_model=list[schemas.HeritageLeadOut])
def list_leads(db: Session = Depends(get_db)):
    """Return all heritage leads."""
    return crud.get_leads(db)


@router.get("/{lead_id}", response_model=schemas.HeritageLeadOut)
def get_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = crud.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/", response_model=schemas.HeritageLeadOut, status_code=201)
def submit_lead(payload: schemas.HeritageLeadCreate, db: Session = Depends(get_db)):
    existing = crud.get_lead(db, payload.id)
    if existing:
        raise HTTPException(status_code=409, detail="A lead with this id already exists")
    return crud.create_lead(db, payload)


@router.patch("/{lead_id}/status", response_model=schemas.HeritageLeadOut)
def update_status(
    lead_id: str,
    status: LeadStatus = Body(..., embed=True),
    assigned_contributor: str | None = Body(None, embed=True),
    db: Session = Depends(get_db),
):
    lead = crud.update_lead_status(db, lead_id, status, assigned_contributor)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead
