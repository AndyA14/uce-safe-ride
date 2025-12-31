from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.sessions import get_db
from app.db.models import Vehicle
from app.api.v1.schemas.vehicles import (
    VehicleCreateIn,
    VehicleUpdateIn,
    VehicleStatusUpdateIn,
    VehicleOut,
)
from app.api.v1.schemas.vehicles import VehicleStatusUpdateIn
from app.core.security import require_role

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post(
    "",
    response_model=VehicleOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def create_vehicle(payload: VehicleCreateIn, db: Session = Depends(get_db)):
    existing = db.query(Vehicle).filter(Vehicle.plate == payload.plate).first()
    if existing:
        raise HTTPException(status_code=409, detail="Vehicle plate already exists")

    v = Vehicle(
        plate=payload.plate,
        brand=payload.brand,
        model=payload.model,
        active=payload.active,
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


@router.get(
    "",
    response_model=list[VehicleOut],
    dependencies=[Depends(require_role(["ADMIN", "STUDENT", "DRIVER"]))],
)
def list_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).order_by(Vehicle.created_at.desc()).all()


@router.get(
    "/{vehicle_id}",
    response_model=VehicleOut,
    dependencies=[Depends(require_role(["ADMIN", "STUDENT", "DRIVER"]))],
)
def get_vehicle(vehicle_id: UUID, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


@router.put(
    "/{vehicle_id}",
    response_model=VehicleOut,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def update_vehicle(vehicle_id: UUID, payload: VehicleUpdateIn, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if payload.plate is not None:
        # evitar duplicado
        existing = db.query(Vehicle).filter(Vehicle.plate == payload.plate, Vehicle.id != vehicle_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="Vehicle plate already exists")
        v.plate = payload.plate

    if payload.brand is not None:
        v.brand = payload.brand
    if payload.model is not None:
        v.model = payload.model
    if payload.active is not None:
        v.active = payload.active

    db.commit()
    db.refresh(v)
    return v


@router.delete(
    "/{vehicle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def delete_vehicle(vehicle_id: UUID, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    db.delete(v)
    db.commit()
    return None


@router.patch(
    "/{vehicle_id}/status",
    response_model=VehicleOut,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def set_vehicle_status(vehicle_id: UUID, payload: VehicleStatusUpdateIn, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    v.active = payload.active
    db.commit()
    db.refresh(v)
    return v
