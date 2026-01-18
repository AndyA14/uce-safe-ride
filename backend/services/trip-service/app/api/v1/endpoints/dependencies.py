from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.db.sessions import get_db
from app.services.trip_service import TripService
from app.services.passenger_service import PassengerService
from app.services.validation_service import ValidationService
from app.services.event_publisher import event_publisher
from app.core.security import get_current_user, TokenData
from app.db.models import Trip


def get_trip_service(db: Session = Depends(get_db)) -> TripService:
    """Dependency para obtener instancia de TripService"""
    return TripService(db, event_publisher)


def get_passenger_service(db: Session = Depends(get_db)) -> PassengerService:
    """Dependency para obtener instancia de PassengerService"""
    return PassengerService(db, event_publisher)


def get_validation_service() -> ValidationService:
    """Dependency para obtener instancia de ValidationService"""
    return ValidationService()


async def get_trip_or_404(
    trip_id: int,
    trip_service: TripService = Depends(get_trip_service)
) -> Trip:
    """
    Dependency que obtiene un viaje o lanza 404.
    Útil para evitar repetir código en endpoints.
    """
    return trip_service.get_trip(trip_id)


async def verify_trip_ownership(
    trip: Trip = Depends(get_trip_or_404),
    current_user: TokenData = Depends(get_current_user)
) -> Trip:
    """
    Verifica que el usuario actual sea el dueño del viaje.
    Solo para drivers.
    """
    if current_user.role != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo conductores pueden acceder a este recurso"
        )
    
    if trip.driver_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este viaje"
        )
    
    return trip













