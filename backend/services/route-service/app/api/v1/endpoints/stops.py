import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.db.models import Stop
from app.api.v1.schemas.stops import StopCreateIn, StopOut

router = APIRouter()

@router.get("", response_model=list[StopOut])
def list_stops(principal=Depends(require_role("STUDENT", "DRIVER", "ADMIN")), db: Session = Depends(get_db)):
    return db.query(Stop).all()

@router.post("", response_model=StopOut, status_code=status.HTTP_201_CREATED)
def create_stop(payload: StopCreateIn, principal=Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    stop = Stop(
        name=payload.name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        active=payload.active,
    )
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return stop
