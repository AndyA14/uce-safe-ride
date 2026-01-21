from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil

from app.db.sessions import get_db
from app.db.models import Trip 

from app.schemas.trips import (
    TripCreate,
    TripUpdate,
    TripResponse,
    TripListResponse,
    TripFilterParams,
    PassengerCreate,   
    StudentResponse    
)

from app.services.trip_service import TripService
from app.core.security import (
    get_current_user,
    get_current_driver,
    get_current_admin,
    TokenData
)
from app.api.v1.endpoints.dependencies import get_trip_service

router = APIRouter()

# ==========================================
# ENDPOINTS DE PASAJEROS
# ==========================================

@router.post("/by-route/{route_id}/board", response_model=StudentResponse)
async def board_trip_by_route(
    route_id: str, 
    passenger_data: PassengerCreate,
    db: Session = Depends(get_db)
):
    """
    Permite a un estudiante subirse al bus activo de una ruta específica.
    """
    trip_service = TripService(db)
    active_trip = trip_service.get_active_trip_by_route(db, route_id)
    
    if not active_trip:
        raise HTTPException(
            status_code=404, 
            detail="No hay unidades activas o disponibles en esta ruta ahora mismo."
        )

    try:
        new_passenger = trip_service.add_passenger(
            db=db, 
            trip_id=active_trip.id,
            passenger_data=passenger_data
        )
        return new_passenger
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==========================================
# ENDPOINTS CRUD
# ==========================================

@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_data: TripCreate,
    trip_service: TripService = Depends(get_trip_service),
    # current_driver: TokenData = Depends(get_current_driver) # Opcional según tu auth
):
    """Crea un nuevo viaje."""
    try:
        return trip_service.create_trip(trip_data, token=None)
    except Exception as e:
        if "ya tiene viaje activo" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        raise e

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    return trip_service.get_trip(trip_id)

@router.get("/", response_model=TripListResponse)
def list_trips(
    page: int = Query(1, gt=0),
    page_size: int = Query(10, gt=0, le=100),
    driver_id: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    route_id: Optional[str] = None,
    status: Optional[str] = None, # 🟢 Este es el filtro clave
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Lista viajes. 
    Usa ?status=ACTIVE para ver solo los que están en curso.
    """
    filters = TripFilterParams(
        page=page,
        page_size=page_size,
        driver_id=driver_id,
        vehicle_id=vehicle_id,
        route_id=route_id,
        status=status
    )
    
    items, total = trip_service.list_trips(filters)
    
    return TripListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size)
    )

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    trip_update: TripUpdate,
    trip_service: TripService = Depends(get_trip_service),
    current_driver: TokenData = Depends(get_current_driver)
):
    try:
        return trip_service.update_trip(trip_id, trip_update)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    trip_service: TripService = Depends(get_trip_service),
    current_admin: TokenData = Depends(get_current_admin)
):
    try:
        trip_service.delete_trip(trip_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))