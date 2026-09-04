"""
Routes for Condition Reports.

Endpoints:

    POST /api/condition-reports/
        Submit a verified condition report.

    GET /api/condition-reports/
        List all condition reports.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/condition-reports",
    tags=["Condition Reports"],
)


@router.post(
    "/",
    response_model=schemas.ConditionReportOut,
    status_code=201,
)
def create_condition_report(
    payload: schemas.ConditionReportCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new condition report for an existing heritage site.
    """

    # Make sure the referenced heritage site exists
    from models import HeritageSite

    site = (
        db.query(HeritageSite)
        .filter(HeritageSite.id == payload.site_id)
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=404,
            detail="Heritage site not found",
        )

    # Prevent duplicate report IDs
    from models import ConditionReport

    existing = (
        db.query(ConditionReport)
        .filter(ConditionReport.id == payload.id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A condition report with this id already exists",
        )

    try:
        return crud.create_condition_report(
            db,
            payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get(
    "/",
    response_model=list[schemas.ConditionReportOut],
)
def list_condition_reports(
    db: Session = Depends(get_db),
):
    """
    Return all condition reports.
    """

    from models import ConditionReport

    return (
        db.query(ConditionReport)
        .order_by(ConditionReport.created_at.desc())
        .all()
    )

@router.patch(
    "/{report_id}",
    response_model=schemas.ConditionReportOut,
)
def update_condition_report(
    report_id: str,
    resolved: bool,
    db: Session = Depends(get_db),
):
    """
    Mark a condition report as resolved or unresolved.
    """

    report = crud.resolve_condition_report(
        db,
        report_id,
        resolved,
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Condition report not found",
        )

    return report