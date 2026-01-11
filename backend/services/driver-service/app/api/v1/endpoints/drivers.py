from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Driver
from app.api.deps import get_current_user 


from app.api.v1.schemas.drivers import (
    DriverCreateIn,
    DriverUpdateIn,
    DriverOut,
    DriverStatusUpdateIn,
)

router = APIRouter()

# =======================
#  RUTAS DE USUARIO 
# =======================

@router.get("/me", response_model=DriverOut) 
def get_my_driver(
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db),
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    
    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver profile not found",
        )
    return driver

@router.put("/me", response_model=DriverOut)
def update_my_driver(
    payload: DriverUpdateIn,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    if payload.name is not None:
        driver.name = payload.name
    if payload.phone is not None:
        driver.phone = payload.phone
    db.commit()
    db.refresh(driver)
    return driver

@router.patch("/me/status", response_model=DriverOut)
def set_my_driver_status(
    status_in: DriverStatusUpdateIn, 
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cambia el estado (AVAILABLE, BUSY, ON_ROUTE, OFFLINE)
    """
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    driver.status = status_in.status
    db.commit()
    db.refresh(driver)
    return driver


# =======================
#  RUTAS GENERALES / ADMIN (VAN DESPUÉS)
# =======================

@router.post("", response_model=DriverOut, status_code=status.HTTP_201_CREATED)
def create_driver(
    payload: DriverCreateIn, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user) 
):
    existing = db.query(Driver).filter(
        Driver.license_number == payload.license_number
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="License already exists",
        )
    driver = Driver(
        user_id=current_user.id, 
        name=payload.name,
        license_number=payload.license_number,
        phone=payload.phone,
        ci=payload.ci, 
        status="AVAILABLE"
    )

    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

@router.get("", response_model=List[DriverOut])
def list_drivers(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Driver).order_by(Driver.created_at.desc()).all()

@router.get("/{driver_id}", response_model=DriverOut)
def get_driver_by_id(driver_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver