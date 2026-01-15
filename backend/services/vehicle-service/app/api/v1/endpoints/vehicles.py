from datetime import datetime
from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.sessions import get_db
from app.db.models import Vehicle, Passenger
from app.api.v1.schemas.vehicles import (
    VehicleCreateIn,
    VehicleOut,
    VehicleUpdateIn,
    VehicleStatusUpdateIn,
    JoinResponse,
)
from app.core.security import require_role

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

# =========================================================
# LISTAR VEHÍCULOS
# =========================================================
@router.get(
    "/",
    response_model=List[VehicleOut],
    dependencies=[Depends(require_role(["ADMIN", "STUDENT", "DRIVER"]))],
)
def list_vehicles(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle).filter(Vehicle.is_active == True)
    if status:
        query = query.filter(Vehicle.status == status)
    return query.offset(skip).limit(limit).all()


# =========================================================
# ENDPOINTS ESTUDIANTE
# =========================================================
@router.get(
    "/student/me",
    response_model=Optional[VehicleOut],
    dependencies=[Depends(require_role(["STUDENT"]))],
)
def get_my_vehicle(
    current_user: dict = Depends(require_role(["STUDENT"])),
    db: Session = Depends(get_db)
):
    active_ride = db.query(Passenger).filter(
        Passenger.student_user_id == current_user["user_id"],
        Passenger.status == "ON_BOARD"
    ).first()

    if not active_ride:
        return None

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == active_ride.vehicle_id
    ).first()

    return vehicle


@router.post(
    "/{vehicle_id}/board",
    response_model=JoinResponse,
    dependencies=[Depends(require_role(["STUDENT"]))],
)
def board_vehicle(
    vehicle_id: UUID,
    current_user: dict = Depends(require_role(["STUDENT"])),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    passenger_count = db.query(Passenger).filter(
        Passenger.vehicle_id == vehicle_id,
        Passenger.status == "ON_BOARD"
    ).count()

    if passenger_count >= vehicle.capacity:
        raise HTTPException(status_code=400, detail="Vehicle is full")

    existing = db.query(Passenger).filter(
        Passenger.vehicle_id == vehicle_id,
        Passenger.student_user_id == current_user["user_id"],
        Passenger.status == "ON_BOARD"
    ).first()

    if existing:
        return JoinResponse(
            message="Already on board",
            vehicle_id=vehicle_id,
            seat_number=passenger_count,
            status="ON_BOARD"
        )

    passenger = Passenger(
        vehicle_id=vehicle_id,
        student_user_id=current_user["user_id"],
        status="ON_BOARD"
    )
    db.add(passenger)
    db.commit()

    return JoinResponse(
        message="Welcome aboard",
        vehicle_id=vehicle_id,
        seat_number=passenger_count + 1,
        status="ON_BOARD"
    )


# =========================================================
# NUEVO ENDPOINT: ESTUDIANTE SE BAJA DEL BUS
# =========================================================
@router.post("/{vehicle_id}/leave")
def leave_vehicle(
    vehicle_id: UUID,
    current_user: dict = Depends(require_role(["STUDENT"])),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    passenger = db.query(Passenger).filter(
        Passenger.vehicle_id == vehicle_id,
        Passenger.student_user_id == user_id,
        Passenger.status == "ON_BOARD"
    ).first()

    if not passenger:
        raise HTTPException(
            status_code=404,
            detail="No estás registrado en este vehículo o ya te has bajado."
        )

    # Cambiar estado para mantener historial
    passenger.status = "DROPPED_OFF"
    passenger.end_time = datetime.utcnow()  # Si tu modelo tiene este campo

    db.commit()

    return {"message": "Te has bajado del vehículo exitosamente"}


# =========================================================
# ENDPOINTS ADMIN / DRIVER / GENÉRICOS
# =========================================================
@router.get(
    "/{vehicle_id}",
    response_model=VehicleOut,
    dependencies=[Depends(require_role(["ADMIN", "STUDENT", "DRIVER"]))],
)
def get_vehicle(vehicle_id: UUID, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.put(
    "/{vehicle_id}",
    response_model=VehicleOut,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def update_vehicle(
    vehicle_id: UUID,
    payload: VehicleUpdateIn,
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if payload.plate and payload.plate != vehicle.plate:
        if db.query(Vehicle).filter(
            Vehicle.plate == payload.plate,
            Vehicle.id != vehicle_id
        ).first():
            raise HTTPException(status_code=409, detail="Vehicle plate already exists")
        vehicle.plate = payload.plate

    for field in ["vehicle_type", "capacity", "status", "driver_id", "model"]:
        value = getattr(payload, field, None)
        if value is not None:
            setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.patch(
    "/{vehicle_id}/status",
    response_model=VehicleOut,
    dependencies=[Depends(require_role(["ADMIN", "DRIVER"]))],
)
def set_vehicle_status(
    vehicle_id: UUID,
    payload: VehicleStatusUpdateIn,
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    vehicle.status = payload.status
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.post(
    "/{vehicle_id}/claim",
    response_model=VehicleOut,
    dependencies=[Depends(require_role(["DRIVER"]))],
)
def claim_vehicle(
    vehicle_id: UUID,
    current_user: dict = Depends(require_role(["DRIVER"])),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.driver_id and str(vehicle.driver_id) != current_user["user_id"]:
        raise HTTPException(
            status_code=409,
            detail="Vehicle is currently driven by another driver"
        )

    vehicle.driver_id = UUID(current_user["user_id"])
    vehicle.status = "IN_ROUTE"
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete(
    "/{vehicle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def delete_vehicle(vehicle_id: UUID, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    vehicle.is_active = False
    db.commit()
    return None


@router.post(
    "/",
    response_model=VehicleOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def create_vehicle(payload: VehicleCreateIn, db: Session = Depends(get_db)):
    if db.query(Vehicle).filter(Vehicle.plate == payload.plate).first():
        raise HTTPException(status_code=409, detail="Vehicle plate already exists")

    vehicle = Vehicle(**payload.dict(), is_active=True)
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle
