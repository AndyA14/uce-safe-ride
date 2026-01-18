from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from math import ceil

from app.db.sessions import get_db
from app.schemas.trips import (
    TripCreate, TripUpdate, TripResponse, TripListResponse,
    TripFilterParams, TripWithPassengers
)
from app.services.trip_service import TripService
from app.services.validation_service import ValidationService
from app.services.event_publisher import event_publisher
from app.core.security import get_current_user, get_current_driver, get_current_admin, TokenData
from app.api.v1.endpoints.dependencies import get_trip_service, get_validation_service

router = APIRouter()


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_data: TripCreate,
    db: Session = Depends(get_db),
    validation_service: ValidationService = Depends(get_validation_service),
    current_user: TokenData = Depends(get_current_driver)
):
    """
    Crea un nuevo viaje.
    
    Validaciones:
    - El driver_id debe coincidir con el usuario autenticado
    - El conductor no debe tener otro viaje activo
    - La ruta debe existir y estar activa
    - El vehículo debe existir y estar disponible
    
    Solo conductores pueden crear viajes.
    """
    # Validar que el conductor esté creando su propio viaje
    if trip_data.driver_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes crear viajes para ti mismo"
        )
    
    # Crear servicio con validaciones
    trip_service = TripService(db, event_publisher, validation_service)
    
    # Crear viaje (con validaciones externas)
    trip = await trip_service.create_trip(trip_data)
    return TripResponse.from_orm_with_computed(trip)


@router.get("/", response_model=TripListResponse)
async def list_trips(
    route_id: Optional[int] = Query(None, description="Filtrar por ruta"),
    driver_id: Optional[int] = Query(None, description="Filtrar por conductor"),
    vehicle_id: Optional[int] = Query(None, description="Filtrar por vehículo"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    page: int = Query(1, ge=1, description="Página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Lista viajes con filtros y paginación.
    
    Permisos:
    - **Conductores**: Solo ven sus propios viajes
    - **Estudiantes**: Ven todos los viajes
    - **Admins**: Ven todos los viajes
    """
    # Si es conductor, forzar filtro por driver_id
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
        items=[TripResponse.from_orm_with_computed(trip) for trip in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size)
    )


@router.get("/{trip_id}", response_model=TripWithPassengers)
async def get_trip(
    trip_id: int,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtiene detalles de un viaje específico con lista de pasajeros.
    
    Permisos:
    - **Conductores**: Solo sus propios viajes
    - **Estudiantes**: Todos los viajes
    - **Admins**: Todos los viajes
    """
    trip = trip_service.get_trip(trip_id)
    
    # Conductores solo pueden ver sus propios viajes
    if current_user.role == "driver" and trip.driver_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este viaje"
        )
    
    return TripWithPassengers.from_orm_with_computed(trip)


@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: int,
    trip_data: TripUpdate,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_driver)
):
    """
    Actualiza información de un viaje.
    
    Solo el conductor propietario puede actualizar.
    Solo se puede actualizar si el viaje está en estado CREATED.
    """
    trip = trip_service.get_trip(trip_id)
    
    if trip.driver_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes actualizar tus propios viajes"
        )
    
    updated_trip = trip_service.update_trip(trip_id, trip_data)
    return TripResponse.from_orm_with_computed(updated_trip)


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_admin)
):
    """
    Elimina un viaje.
    
    Solo administradores pueden eliminar viajes.
    Solo se puede eliminar si está en estado CREATED.
    """
    trip_service.delete_trip(trip_id)


@router.get("/driver/active", response_model=Optional[TripResponse])
async def get_driver_active_trip(
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_driver)
):
    """
    Obtiene el viaje activo del conductor autenticado.
    
    **CRÍTICO**: Este endpoint es usado por WebSocket Gateway para:
    - Validar que el conductor tenga un viaje activo
    - Obtener el route_id para aislar mensajes por ruta
    
    Retorna:
    - Trip activo si existe
    - null si el conductor no tiene viajes activos
    """
    trip = trip_service.get_active_trip_by_driver(current_user.user_id)
    
    if not trip:
        return None
    
    return TripResponse.from_orm_with_computed(trip)


@router.get("/route/{route_id}/active", response_model=List[TripResponse])
async def get_route_active_trips(
    route_id: int,
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtiene todos los viajes activos de una ruta.
    
    Útil para:
    - Estudiantes que quieren ver viajes disponibles
    - Dashboard de administración
    - Chatbot/Recommendation Service
    """
    trips = trip_service.get_active_trips_by_route(route_id)
    return [TripResponse.from_orm_with_computed(trip) for trip in trips]


@router.get("/upcoming", response_model=List[TripResponse])
async def get_upcoming_trips(
    hours_ahead: int = Query(24, ge=1, le=168, description="Horas hacia adelante"),
    route_id: Optional[int] = Query(None, description="Filtrar por ruta"),
    trip_service: TripService = Depends(get_trip_service),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtiene viajes programados en las próximas N horas.
    
    Útil para:
    - Planificación de estudiantes
    - Dashboard de conductores
    - Chatbot/Recommendation Service
    """
    trips = trip_service.get_upcoming_trips(hours_ahead, route_id)
    return [TripResponse.from_orm_with_computed(trip) for trip in trips]