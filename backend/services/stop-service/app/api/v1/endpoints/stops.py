from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.db.models import Stop
from app.schemas.stop import StopCreate, StopUpdate, StopOut
from app.core.security import require_role
from app.core.security import require_role
router = APIRouter(prefix="/stops", tags=["Stops"])

@router.post(
    "",
    response_model=StopOut,
    status_code=status.HTTP_201_CREATED,
)
def create_stop(
    data: StopCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("ADMIN")),
):
    stop = Stop(**data.model_dump())
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return stop

@router.get("", response_model=list[StopOut])
def list_stops(
    db: Session = Depends(get_db),
):
    return db.query(Stop).filter(Stop.active == True).all()

@router.get("/{stop_id}", response_model=StopOut)
def get_stop(
    stop_id: UUID,
    db: Session = Depends(get_db),
):
    stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    return stop

@router.put("/{stop_id}", response_model=StopOut)
def update_stop(
    stop_id: UUID,
    data: StopUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("ADMIN")),
):
    stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(stop, key, value)

    db.commit()
    db.refresh(stop)
    return stop

@router.delete("/{stop_id}", status_code=204)
def deactivate_stop(
    stop_id: UUID,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("ADMIN")),
):
    stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")

    stop.active = False
    db.commit()

