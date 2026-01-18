from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.sessions import get_db
from app.schemas.trips import (
    TripResponse, TripStartRequest, TripCompleteRequest,
    TripCancelRequest, TripLocationUpdate
)
from app.services.trip_service import TripService
from app.services.event_publisher import event_publisher
from app.core.security import get_current_driver, TokenData
from app.api.v1.endpoints.dependencies import (
    get_trip_service, verify_trip_ownership
)
from app.db.models import Trip

router = APIRouter()


@router.post(
    "/{trip_id}/start",
    response_model=TripResponse,
    summary="Iniciar viaje",
    description="Cambia el estado del viaje a ACTIVE y emite evento trip.started"
)
async def start_trip(
    trip_id: int,
    start_data: TripStartRequest,
    trip: Trip = Depends(verify_trip_ownership),
    trip_service: TripService = Depends(get_trip_service)
):
    """
    Inicia un viaje.
    
    - Cambia estado a **ACTIVE**
    - Registra ubicación inicial
    - Registra hora de inicio real
    - Emite evento **trip.started** (crítico para WebSocket y Tracking)
    
    **Solo el conductor propietario puede iniciar el viaje.**
    """
    started_trip = trip_service.start_trip(trip_id, start_data)
    return TripResponse.from_orm_with_computed(started_trip)


@router.post(
    "/{trip_id}/complete",
    response_model=TripResponse,
    summary="Completar viaje",
    description="Finaliza el viaje exitosamente y emite evento trip.completed"
)
async def complete_trip(
    trip_id: int,
    complete_data: TripCompleteRequest,
    trip: Trip = Depends(verify_trip_ownership),
    trip_service: TripService = Depends(get_trip_service)
):
    """
    Completa un viaje exitosamente.
    
    - Cambia estado a **COMPLETED**
    - Registra ubicación final
    - Registra hora de finalización
    - Marca todos los pasajeros abordados como **COMPLETED**
    - Emite evento **trip.completed** (crítico para Payment Service)
    
    **Solo el conductor propietario puede completar el viaje.**
    """
    completed_trip = trip_service.complete_trip(trip_id, complete_data)
    return TripResponse.from_orm_with_computed(completed_trip)


@router.post(
    "/{trip_id}/cancel",
    response_model=TripResponse,
    summary="Cancelar viaje",
    description="Cancela el viaje antes de completarlo"
)
async def cancel_trip(
    trip_id: int,
    cancel_data: TripCancelRequest,
    trip: Trip = Depends(verify_trip_ownership),
    trip_service: TripService = Depends(get_trip_service)
):
    """
    Cancela un viaje.
    
    - Cambia estado a **CANCELLED**
    - Emite evento **trip.cancelled**
    - Notifica a todos los pasajeros
    
    **Solo el conductor propietario puede cancelar el viaje.**
    """
    cancelled_trip = trip_service.cancel_trip(trip_id, cancel_data.reason)
    return TripResponse.from_orm_with_computed(cancelled_trip)


@router.patch(
    "/{trip_id}/location",
    response_model=TripResponse,
    summary="Actualizar ubicación del viaje",
    description="Actualiza la ubicación GPS actual del viaje activo"
)
async def update_trip_location(
    trip_id: int,
    location: TripLocationUpdate,
    trip: Trip = Depends(verify_trip_ownership),
    trip_service: TripService = Depends(get_trip_service)
):
    """
    Actualiza la ubicación GPS actual del viaje.
    
    - Solo viajes en estado **ACTIVE** pueden actualizar ubicación
    - Registra timestamp de la actualización
    - Opcionalmente emite evento **trip.location_updated**
    
    **Solo el conductor propietario puede actualizar la ubicación.**
    
    **Nota**: Para tracking en tiempo real, considera usar MQTT/Redis
    directamente desde la app del conductor en lugar de HTTP.
    """
    updated_trip = trip_service.update_location(trip_id, location)
    return TripResponse.from_orm_with_computed(updated_trip)