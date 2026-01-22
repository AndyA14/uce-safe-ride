from fastapi import APIRouter, Depends, status, Query, HTTPException, Body
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
    summary="Agregar pasajero a viaje"
)
async def add_passenger_to_trip(
    trip_id: int,
    passenger_data: TripPassengerCreate,
    passenger_service: PassengerService = Depends(get_passenger_service),
    current_user: TokenData = Depends(get_current_student) 
):
    # MODO TESIS: Bypass de validación de identidad
    # Permitimos agregar cualquier student_id sin importar quién seas
    
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
    return [TripPassengerResponse.model_validate(p) for p in passengers]

@router.get(
    "/{trip_id}/passengers/{passenger_id}",
    response_model=TripPassengerResponse,
    summary="Obtener detalle de un pasajero"
)
async def get_passenger_detail(
    trip_id: int,
    passenger_id: str, # ✅ CAMBIO: int -> str (Para aceptar UUID)
    passenger_service: PassengerService = Depends(get_passenger_service),
    current_user: TokenData = Depends(get_current_user)
):
    passenger = passenger_service.get_passenger(trip_id, passenger_id)
    if not passenger:
        raise HTTPException(status_code=404, detail="Pasajero no encontrado")
        
    return TripPassengerResponse.model_validate(passenger)

@router.patch(
    "/{trip_id}/passengers/{passenger_id}/board",
    response_model=TripPassengerResponse,
    summary="Marcar pasajero como abordado"
)
async def board_passenger(
    trip_id: int,
    passenger_id: str, # ✅ CAMBIO: int -> str (Para aceptar UUID)
    board_data: PassengerBoardRequest,
    passenger_service: PassengerService = Depends(get_passenger_service),
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_driver)
):
    trip = trip_service.get_trip(trip_id)
    if not trip:
         raise HTTPException(status_code=404, detail="Viaje no encontrado")

    passenger = passenger_service.board_passenger(trip_id, passenger_id, board_data)
    return TripPassengerResponse.model_validate(passenger)

@router.delete(
    "/{trip_id}/passengers/{passenger_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar pasajero del viaje"
)
async def remove_passenger_from_trip(
    trip_id: int,
    passenger_id: str, # ✅ CAMBIO CRÍTICO: int -> str
    # ⚠️ IMPORTANTE: Si el frontend envía 'reason' en la URL (Query Param):
    reason: str = Query(..., min_length=5, max_length=200),
    
    # ⚠️ OPCIONAL: Si decidiste enviarlo en el BODY desde el frontend, 
    # tendrías que cambiar la línea de arriba por algo como:
    # payload: DeletePassengerSchema = Body(...) 
    # Pero intentemos primero solo cambiando el ID a str.
    
    passenger_service: PassengerService = Depends(get_passenger_service),
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    # Bypass para permitir borrar libremente en demo
    passenger_service.remove_passenger(trip_id, passenger_id, reason)

@router.get(
    "/students/me/trips",
    response_model=List[TripPassengerResponse],
    summary="Obtener mis viajes como estudiante"
)
async def get_my_student_trips(
    active_only: bool = Query(False),
    passenger_service: PassengerService = Depends(get_passenger_service),
    current_user: TokenData = Depends(get_current_student)
):
    trips = passenger_service.get_student_trips(current_user.user_id, active_only)
    return [TripPassengerResponse.model_validate(t) for t in trips]