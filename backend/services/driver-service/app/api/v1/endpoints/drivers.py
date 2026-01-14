from typing import List, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Driver, DriverStatus
from app.api.deps import require_role
from app.api.v1.schemas.drivers import (
    DriverCreateIn,
    DriverUpdateIn,
    DriverOut,
    DriverStatusUpdateIn,
)

router = APIRouter()

@router.get("/me", response_model=DriverOut)
def get_my_driver(
    current_user: Dict[str, Any] = Depends(require_role("DRIVER")),
    db: Session = Depends(get_db),
):
    driver = (
        db.query(Driver)
        .filter(Driver.auth_user_id == current_user["user_id"])
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver profile not found"
        )

    return driver

@router.put("/me", response_model=DriverOut)
def update_my_driver(
    payload: DriverUpdateIn,
    current_user: Dict[str, Any] = Depends(require_role("DRIVER")),
    db: Session = Depends(get_db),
):
    driver = (
        db.query(Driver)
        .filter(Driver.auth_user_id == current_user["user_id"])
        .first()
    )

    if not driver:
        driver = Driver(
            auth_user_id=current_user["user_id"],
            status=DriverStatus.OFFLINE,
        )
        db.add(driver)
        db.commit()
        db.refresh(driver)

    if payload.name is not None:
        driver.name = payload.name
    if payload.phone is not None:
        driver.phone = payload.phone

    db.commit()
    db.refresh(driver)
    return driver

@router.patch("/me/status", response_model=DriverOut)
def set_my_driver_status(
    payload: DriverStatusUpdateIn,
    current_user: Dict[str, Any] = Depends(require_role("DRIVER")),
    db: Session = Depends(get_db),
):
    driver = (
        db.query(Driver)
        .filter(Driver.auth_user_id == current_user["user_id"])
        .first()
    )

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver profile not found"
        )

    driver.status = payload.status
    db.commit()
    db.refresh(driver)
    return driver

@router.post(
    "",
    response_model=DriverOut,
    status_code=status.HTTP_201_CREATED
)
def create_driver(
    payload: DriverCreateIn,
    _: Dict[str, Any] = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    # Unicidad por usuario auth
    if db.query(Driver).filter(
        Driver.auth_user_id == payload.auth_user_id
    ).first():
        raise HTTPException(
            status_code=409,
            detail="Driver already exists for this user"
        )

    # Unicidad CI
    if db.query(Driver).filter(
        Driver.ci == payload.ci
    ).first():
        raise HTTPException(
            status_code=409,
            detail="CI already in use"
        )

    # Unicidad licencia
    if db.query(Driver).filter(
        Driver.license_number == payload.license_number
    ).first():
        raise HTTPException(
            status_code=409,
            detail="License number already in use"
        )

    driver = Driver(
        auth_user_id=payload.auth_user_id,
        name=payload.name,
        phone=payload.phone,
        ci=payload.ci,
        license_number=payload.license_number,
        status=DriverStatus.OFFLINE,
    )

    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

@router.get("", response_model=List[DriverOut])
def list_drivers(
    _: Dict[str, Any] = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    return (
        db.query(Driver)
        .order_by(Driver.created_at.desc())
        .all()
    )

@router.get("/{driver_id}", response_model=DriverOut)
def get_driver_by_id(
    driver_id: UUID,
    _: Dict[str, Any] = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    driver = db.get(Driver, driver_id)

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found"
        )

    return driver
