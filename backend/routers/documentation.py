from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db


router = APIRouter(
    prefix="/api/documentation",
    tags=["Documentation"]
)


@router.post(
    "/",
    response_model=schemas.HeritageDocumentationOut,
    status_code=201
)
def create_documentation(
    payload: schemas.HeritageDocumentationCreate,
    db: Session = Depends(get_db)
):
    try:
        return crud.create_documentation(
            db,
            payload
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.get(
    "/lead/{lead_id}",
    response_model=schemas.HeritageDocumentationOut
)
def get_documentation(
    lead_id: str,
    db: Session = Depends(get_db)
):
    return crud.get_documentation_by_lead(
        db,
        lead_id
    )