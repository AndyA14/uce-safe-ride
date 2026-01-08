from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.sessions import get_db
from app.db.models import Vehicle
from app.api.v1.schemas.vehicles import (
    VehicleCreateIn,
    VehicleOut,
    VehicleUpdateIn,
    VehicleStatusUpdateIn,
)
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
        vehicle_type=payload.vehicle_type,
        capacity=payload.capacity,
        status=payload.status,
        student_user_id=payload.student_user_id, 
        is_active=True
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
    "/student/{student_id}",
    response_model=list[VehicleOut],
    dependencies=[Depends(require_role(["ADMIN", "STUDENT"]))],
)
def list_vehicles_by_student(student_id: str, db: Session = Depends(get_db)):
    """
    Devuelve los vehículos activos asociados a un estudiante específico.
    """
    vehicles = (
        db.query(Vehicle)
        .filter(
            Vehicle.student_user_id == student_id,
            Vehicle.is_active == True
        )
        .all()
    )
    return vehicles

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

    if payload.plate is not None and payload.plate != v.plate:
        existing = db.query(Vehicle).filter(Vehicle.plate == payload.plate, Vehicle.id != vehicle_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="Vehicle plate already exists")
        v.plate = payload.plate

    if payload.vehicle_type is not None:
        v.vehicle_type = payload.vehicle_type

    if payload.capacity is not None:
        v.capacity = payload.capacity

    if payload.status is not None:
        v.status = payload.status

    db.commit()
    db.refresh(v)
    return v


@router.patch(
    "/{vehicle_id}/status",
    response_model=VehicleOut,
    dependencies=[Depends(require_role(["ADMIN", "DRIVER"]))],
)
def set_vehicle_status(vehicle_id: UUID, payload: VehicleStatusUpdateIn, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    v.status = payload.status
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

    v.is_active = False 
    
    db.commit()
    return None