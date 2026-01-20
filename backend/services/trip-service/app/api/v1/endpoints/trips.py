from fastapi import APIRouter, Depends, Query, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from math import ceil

from app.db.sessions import get_db
from app.schemas.trips import (
    TripCreate,
    TripUpdate,
    TripResponse,
    TripListResponse,
    TripFilterParams,
    TripWithPassengers
)
from app.services.trip_service import TripService
from app.services.validation_service import ValidationService
from app.services.event_publisher import event_publisher
from app.core.security import (
    get_current_user,
    get_current_driver,
    get_current_admin,
    TokenData
)
from app.api.v1.endpoints.dependencies import (
    get_trip_service,
    get_validation_service
)
from app.core.config import settings

router = APIRouter()

# ==========================================================
# OAuth2 scheme para capturar TOKEN CRUDO
# ==========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.AUTH_SERVICE_URL}/api/v1/auth/login"
)

# ==========================================================
# CREATE TRIP
# ==========================================================

@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_data: TripCreate,
    db: Session = Depends(get_db),
    validation_service: ValidationService = Depends(get_validation_service),
    current_user: TokenData = Depends(get_current_driver),
    token: str = Depends(oauth2_scheme)
):
    """
    Crea un nuevo viaje.
    """


    await validation_service.validate_trip_creation(
        route_id=trip_data.route_id,
        driver_id=trip_data.driver_id,
        vehicle_id=trip_data.vehicle_id,
        token=token
    )

    trip_service = TripService(db, event_publisher, validation_service)

    trip = trip_service.create_trip(
        trip_data=trip_data,
        token=token
    )

    return TripResponse.from_orm_with_computed(trip)


# ==========================================================
# LIST TRIPS
# ==========================================================

@router.get("/", response_model=TripListResponse)
async def list_trips(
    route_id: Optional[str] = Query(None, description="Ruta (UUID)"),
    driver_id: Optional[str] = Query(None, description="Conductor (UUID)"),
    vehicle_id: Optional[str] = Query(None, description="Vehículo (UUID)"),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role == "driver":
        driver_id = current_user.user_id

    filters = TripFilterParams(
        route_id=route_id,
        driver_id=driver_id,
        vehicle_id=vehicle_id,
        status=status,
        page=page,
        page_size=page_size
    )

    items, total = trip_service.list_trips(filters)

    return TripListResponse(
        items=[TripResponse.from_orm_with_computed(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size)
    )

# ==========================================================
# GET TRIP
# ==========================================================

@router.get("/{trip_id}", response_model=TripWithPassengers)
async def get_trip(
    trip_id: int,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    trip = trip_service.get_trip(trip_id)

    if current_user.role == "driver" and trip.driver_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este viaje"
        )

    return TripWithPassengers.from_orm_with_computed(trip)

# ==========================================================
# UPDATE TRIP
# ==========================================================

@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: int,
    trip_data: TripUpdate,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_driver)
):
    trip = trip_service.get_trip(trip_id)

    if trip.driver_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes actualizar tus propios viajes"
        )

    updated_trip = trip_service.update_trip(trip_id, trip_data)
    return TripResponse.from_orm_with_computed(updated_trip)

# ==========================================================
# DELETE TRIP
# ==========================================================

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_admin)
):
    trip_service.delete_trip(trip_id)

# ==========================================================
# DRIVER ACTIVE TRIP
# ==========================================================

@router.get("/driver/active", response_model=Optional[TripResponse])
async def get_driver_active_trip(
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_driver)
):
    trip = trip_service.get_active_trip_by_driver(current_user.user_id)
    return TripResponse.from_orm_with_computed(trip) if trip else None


@router.post("/{trip_id}/cancel", response_model=TripResponse)
async def cancel_trip_endpoint(
    trip_id: int,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_driver)
):
    """
    Cancela un viaje.
    Drivers pueden cancelar sus propios viajes.
    """
    trip = trip_service.get_trip(trip_id)
    
    # 🎓 THESIS MODE: Bypass de validación de propiedad
    # if trip.driver_id != current_user.user_id:
    #     raise HTTPException(403, "No es tu viaje")
    
    cancelled_trip = trip_service.cancel_trip(
        trip_id, 
        reason="Cancelado por el conductor"
    )
    
    from app.schemas.trips import TripResponse
    return TripResponse.from_orm_with_computed(cancelled_trip)



# ==========================================================
# ROUTE ACTIVE TRIPS
# ==========================================================

@router.get("/route/{route_id}/active", response_model=List[TripResponse])
async def get_route_active_trips(
    route_id: str,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    trips = trip_service.get_active_trips_by_route(route_id)
    return [TripResponse.from_orm_with_computed(t) for t in trips]

# ==========================================================
# UPCOMING TRIPS
# ==========================================================

@router.get("/upcoming", response_model=List[TripResponse])
async def get_upcoming_trips(
    hours_ahead: int = Query(24, ge=1, le=168),
    route_id: Optional[str] = Query(None, description="Ruta (UUID)"),
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    trips = trip_service.get_upcoming_trips(hours_ahead, route_id)
    return [TripResponse.from_orm_with_computed(t) for t in trips]
