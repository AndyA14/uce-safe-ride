from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Driver
from app.api.v1.schemas.drivers import (
    DriverCreateIn,
    DriverUpdateIn,
    DriverOut,
    DriverStatusUpdateIn,
)

from app.core.security import require_role

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.post(
    "",
    response_model=DriverOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def create_driver(payload: DriverCreateIn, db: Session = Depends(get_db)):
    existing = db.query(Driver).filter(
        Driver.license_number == payload.license_number
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="License already exists")

    d = Driver(
        name=payload.name,
        license_number=payload.license_number,
        phone=payload.phone,
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


@router.get(
    "",
    response_model=list[DriverOut],
    dependencies=[Depends(require_role(["ADMIN", "STUDENT"]))],
)
def list_drivers(db: Session = Depends(get_db)):
    return db.query(Driver).order_by(Driver.created_at.desc()).all()


@router.get(
    "/{driver_id}",
    response_model=DriverOut,
    dependencies=[Depends(require_role(["ADMIN", "STUDENT"]))],
)
def get_driver(driver_id: UUID, db: Session = Depends(get_db)):
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Driver not found")
    return d


@router.put(
    "/{driver_id}",
    response_model=DriverOut,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def update_driver(
    driver_id: UUID,
    payload: DriverUpdateIn,
    db: Session = Depends(get_db),
):
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Driver not found")

    if payload.name is not None:
        d.name = payload.name
    if payload.phone is not None:
        d.phone = payload.phone

    db.commit()
    db.refresh(d)
    return d


@router.patch(
    "/{driver_id}/status",
    response_model=DriverOut,
    dependencies=[Depends(require_role(["ADMIN", "DRIVER"]))],
)
def set_driver_status(
    driver_id: UUID,
    payload: DriverStatusUpdateIn,
    db: Session = Depends(get_db),
):
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Driver not found")

    d.status = payload.status
    db.commit()
    db.refresh(d)
    return d


@router.delete(
    "/{driver_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["ADMIN"]))],
)
def delete_driver(driver_id: UUID, db: Session = Depends(get_db)):
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Driver not found")

    db.delete(d)
    db.commit()
    return None
