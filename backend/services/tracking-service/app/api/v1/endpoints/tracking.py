import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import TrackingPoint
from app.schemas.tracking import TrackingCreate, TrackingResponse

router = APIRouter(prefix="/tracking", tags=["tracking"])

@router.post(
    "/points",
    response_model=TrackingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_tracking_point(
    payload: TrackingCreate,
    db: Session = Depends(get_db)
):
    tracking = TrackingPoint(**payload.dict())
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    return tracking


@router.get(
    "/vehicles/{vehicle_id}/latest",
    response_model=TrackingResponse
)
def get_latest_vehicle_position(
    vehicle_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    tracking = (
        db.query(TrackingPoint)
        .filter(TrackingPoint.vehicle_id == vehicle_id)
        .order_by(TrackingPoint.recorded_at.desc())
        .first()
    )

    if not tracking:
        raise HTTPException(
            status_code=404,
            detail="No tracking data found for this vehicle"
        )

    return tracking



