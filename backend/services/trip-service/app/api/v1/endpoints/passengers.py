from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.sessions import get_db
from app.schemas.passengers import (
    TripPassengerCreate, TripPassengerResponse,
    PassengerBoardRequest
)
from app.services.passenger_service import PassengerService
from app.services.trip_service import TripService
from app.services.event_publisher import event_publisher
from app.core.security import (
    get_current_user, get_current_driver, 
    get_current_student, TokenData
)
from app.api.v1.endpoints.dependencies import (
    get_passenger_service, get_trip_service
)

router = APIRouter()


@router.post(
    "/{trip_id}/passengers",
    response_model=TripPassengerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar pasajero a viaje",
    description="Permite a un estudiante unirse a un viaje específico"
)
async def add_passenger_to_trip(
    trip_id: int,
    passenger_data: TripPassengerCreate,
    passenger_service: PassengerService = Depends(get_passenger_service),
    current_user: TokenData = Depends(get_current_student)
):
    # Validar que el estudiante se esté agregando a sí mismo
    if passenger_data.student_id != current_user.user_id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes agregarte a ti mismo a un viaje"
        )
    
    passenger = passenger_service.add_passenger(trip_id, passenger_data)
    return TripPassengerResponse.model_validate(passenger)


@router.get(
    "/{trip_id}/passengers",
    response_model=List[TripPassengerResponse],
    summary="Listar pasajeros de un viaje"
)
async def list_trip_passengers(
    trip_id: int,
    passenger_service: PassengerService = Depends(get_passenger_service),
    current_user: TokenData = Depends(get_current_user)
):
    passengers = passenger_service.list_passengers(trip_id)
    
    # Si es estudiante, verificar que esté en el viaje
    if current_user.role == "student":
        student_in_trip = any(p.student_id == current_user.user_id for p in passengers)
        if not student_in_trip:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a esta información"
            )
    
    # Si es conductor, verificar que sea su viaje
    if current_user.role == "driver":
        from app.services.trip_service import TripService
        trip_service = TripService(passenger_service.db)
        trip = trip_service.get_trip(trip_id)
        
        if trip.driver_id != current_user.user_id:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo puedes ver pasajeros de tus propios viajes"
            )
    
    return [TripPassengerResponse.model_validate(p) for p in passengers]


@router.get(
    "/{trip_id}/passengers/{passenger_id}",
    response_model=TripPassengerResponse,
    summary="Obtener detalle de un pasajero"
)
async def get_passenger_detail(
    trip_id: int,
    passenger_id: int,
    passenger_service: PassengerService = Depends(get_passenger_service),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtiene información detallada de un pasajero específico"""
    passenger = passenger_service.get_passenger(trip_id, passenger_id)
    
    # Validar permisos
    if current_user.role == "student" and passenger.student_id != current_user.user_id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este pasajero"
        )
    
    return TripPassengerResponse.model_validate(passenger)


@router.patch(
    "/{trip_id}/passengers/{passenger_id}/board",
    response_model=TripPassengerResponse,
    summary="Marcar pasajero como abordado"
)
async def board_passenger(
    trip_id: int,
    passenger_id: int,
    board_data: PassengerBoardRequest,
    passenger_service: PassengerService = Depends(get_passenger_service),
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_driver)
):
    """
    Marca un pasajero como abordado.
    Solo el conductor del viaje puede realizar esta acción.
    """
    trip = trip_service.get_trip(trip_id)
    
    if trip.driver_id != current_user.user_id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el conductor del viaje puede marcar pasajeros como abordados"
        )
    
    passenger = passenger_service.board_passenger(trip_id, passenger_id, board_data)
    return TripPassengerResponse.model_validate(passenger)


@router.delete(
    "/{trip_id}/passengers/{passenger_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar pasajero del viaje"
)
async def remove_passenger_from_trip(
    trip_id: int,
    passenger_id: int,
    reason: str = Query(..., min_length=5, max_length=200),
    passenger_service: PassengerService = Depends(get_passenger_service),
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    passenger = passenger_service.get_passenger(trip_id, passenger_id)
    
    # Estudiantes solo pueden eliminarse a sí mismos
    if current_user.role == "student" and passenger.student_id != current_user.user_id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes eliminarte a ti mismo del viaje"
        )
    
    # Conductores solo pueden eliminar de sus propios viajes
    if current_user.role == "driver":
        trip = trip_service.get_trip(trip_id)
        
        if trip.driver_id != current_user.user_id:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo puedes eliminar pasajeros de tus propios viajes"
            )
    
    passenger_service.remove_passenger(trip_id, passenger_id, reason)


@router.get(
    "/students/me/trips",
    response_model=List[TripPassengerResponse],
    summary="Obtener mis viajes como estudiante"
)
async def get_my_student_trips(
    active_only: bool = Query(False, description="Solo viajes activos"),
    passenger_service: PassengerService = Depends(get_passenger_service),
    current_user: TokenData = Depends(get_current_student)
):
    trips = passenger_service.get_student_trips(current_user.user_id, active_only)
    return [TripPassengerResponse.model_validate(t) for t in trips]

