
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.db.sessions import get_db
from app.db.models import Trip
from app.core.security import get_current_user, TokenData
from app.services.trip_service import TripService
from app.services.passenger_service import PassengerService
from app.services.validation_service import ValidationService
from app.services.event_publisher import event_publisher

logger = logging.getLogger(__name__)


def get_validation_service() -> ValidationService:
    """Dependency para obtener instancia de ValidationService"""
    return ValidationService()


def get_trip_service(
    db: Session = Depends(get_db),
    validation_service: ValidationService = Depends(get_validation_service),
) -> TripService:
    """Dependency para obtener instancia de TripService"""
    return TripService(db, event_publisher, validation_service)


def get_passenger_service(
    db: Session = Depends(get_db),
    validation_service: ValidationService = Depends(get_validation_service),
) -> PassengerService:
    """Dependency para obtener instancia de PassengerService"""
    return PassengerService(db, event_publisher, validation_service)


def get_trip_or_404(
    trip_id: int, 
    db: Session = Depends(get_db)
) -> Trip:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=404, 
            detail=f"Viaje {trip_id} no encontrado"
        )
    return trip


async def verify_trip_ownership(
    trip: Trip = Depends(get_trip_or_404),
    current_user: TokenData = Depends(get_current_user),
) -> Trip:
    # 1️⃣ Verificar que el usuario sea conductor
    if current_user.role.lower() != "driver":
        raise HTTPException(
            status_code=403, 
            detail="Solo conductores pueden acceder a este recurso"
        )
    

    logger.info(
        f" Driver {current_user.user_id} accediendo a trip {trip.id} "
        f"(sin validar propiedad)"
    )
    
    return trip