from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.schemas.tracking import LocationIn, LocationOut
from app.db.models import VehicleLocation
from app.db.session import get_db
from app.core.security import require_role

router = APIRouter(prefix="/tracking", tags=["Tracking"])

@router.post(
    "",
    response_model=LocationOut,
    status_code=201,
    dependencies=[Depends(require_role("DRIVER"))],
)
def push_location(data: LocationIn, db: Session = Depends(get_db)):
    location = VehicleLocation(**data.model_dump())
    db.add(location)
    db.commit()
    db.refresh(location)
    return location
