from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
import logging

from app.db.models import Trip, TripStatus, TripPassenger, PassengerStatus
from app.schemas.trips import (
    TripCreate, TripUpdate, TripFilterParams, 
    TripLocationUpdate, TripStartRequest, TripCompleteRequest
)
from app.core.exceptions import (
    TripNotFoundException, TripAlreadyActiveException,
    InvalidTripStatusException, TripFullException
)
from app.services.event_publisher import EventPublisher
from app.services.validation_service import ValidationService

logger = logging.getLogger(__name__)


class TripService:
    """
    Servicio de lógica de negocio para gestión de viajes.
    
    Responsabilidades:
    - CRUD de viajes
    - Gestión del ciclo de vida (start, complete, cancel)
    - Validación con servicios externos
    - Publicación de eventos
    """
    
    def __init__(
        self, 
        db: Session, 
        event_publisher: Optional[EventPublisher] = None,
        validation_service: Optional[ValidationService] = None
    ):
        self.db = db
        self.event_publisher = event_publisher
        self.validation_service = validation_service or ValidationService()
    
    # ==================== CRUD ====================
    
    async def create_trip(self, trip_data: TripCreate) -> Trip:
        """
        Crea un nuevo viaje.
        
        Validaciones:
        1. El conductor no tiene otro viaje activo
        2. La ruta existe y está activa
        3. El conductor existe y está disponible
        4. El vehículo existe y está disponible
        
        Args:
            trip_data: Datos del viaje a crear
        
        Returns:
            Trip creado
        
        Raises:
            TripAlreadyActiveException si el conductor tiene un viaje activo
            ValidationException si las validaciones externas fallan
            ExternalServiceException si algún servicio no responde
        """
        logger.info(
            f"Creando viaje: route={trip_data.route_id}, "
            f"driver={trip_data.driver_id}, vehicle={trip_data.vehicle_id}"
        )
        
        # 1. Verificar que el conductor no tenga viajes activos
        existing_active = self.db.query(Trip).filter(
            and_(
                Trip.driver_id == trip_data.driver_id,
                Trip.status.in_([TripStatus.CREATED, TripStatus.ACTIVE])
            )
        ).first()
        
        if existing_active:
            logger.warning(
                f"Conductor {trip_data.driver_id} ya tiene viaje activo: {existing_active.id}"
            )
            raise TripAlreadyActiveException(trip_data.driver_id)
        
        # 2. Validar con servicios externos
        try:
            await self.validation_service.validate_trip_creation(
                route_id=trip_data.route_id,
                driver_id=trip_data.driver_id,
                vehicle_id=trip_data.vehicle_id
            )
        except Exception as e:
            logger.error(f"Error en validaciones externas: {e}")
            raise
        
        # 3. Crear el viaje
        trip = Trip(
            route_id=trip_data.route_id,
            driver_id=trip_data.driver_id,
            vehicle_id=trip_data.vehicle_id,
            scheduled_start_time=trip_data.scheduled_start_time,
            max_passengers=trip_data.max_passengers,
            status=TripStatus.CREATED
        )
        
        self.db.add(trip)
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip.id} creado exitosamente")
        
        # 4. Publicar evento
        if self.event_publisher:
            self.event_publisher.publish_trip_created(trip)
        
        return trip
    
    def get_trip(self, trip_id: int) -> Trip:
        """
        Obtiene un viaje por ID.
        
        Args:
            trip_id: ID del viaje
        
        Returns:
            Trip encontrado
        
        Raises:
            TripNotFoundException si el viaje no existe
        """
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            logger.warning(f"Viaje {trip_id} no encontrado")
            raise TripNotFoundException(trip_id)
        return trip
    
    def list_trips(self, filters: TripFilterParams) -> Tuple[List[Trip], int]:
        """
        Lista viajes con filtros y paginación.
        
        Args:
            filters: Parámetros de filtrado y paginación
        
        Returns:
            Tupla (items, total_count)
        """
        query = self.db.query(Trip)
        
        # Aplicar filtros
        if filters.route_id:
            query = query.filter(Trip.route_id == filters.route_id)
        if filters.driver_id:
            query = query.filter(Trip.driver_id == filters.driver_id)
        if filters.vehicle_id:
            query = query.filter(Trip.vehicle_id == filters.vehicle_id)
        if filters.status:
            query = query.filter(Trip.status == filters.status)
        if filters.date_from:
            query = query.filter(Trip.scheduled_start_time >= filters.date_from)
        if filters.date_to:
            query = query.filter(Trip.scheduled_start_time <= filters.date_to)
        
        # Contar total
        total = query.count()
        
        # Paginación
        offset = (filters.page - 1) * filters.page_size
        items = query.order_by(Trip.scheduled_start_time.desc()) \
                     .offset(offset) \
                     .limit(filters.page_size) \
                     .all()
        
        logger.info(f"Listando viajes: {len(items)} de {total} total")
        return items, total
    
    def update_trip(self, trip_id: int, trip_data: TripUpdate) -> Trip:
        """
        Actualiza información básica del viaje.
        Solo se puede actualizar si no está activo o completado.
        
        Args:
            trip_id: ID del viaje
            trip_data: Datos a actualizar
        
        Returns:
            Trip actualizado
        
        Raises:
            TripNotFoundException si el viaje no existe
            InvalidTripStatusException si el estado no permite actualización
        """
        trip = self.get_trip(trip_id)
        
        # Solo se puede actualizar si no está activo o completado
        if trip.status in [TripStatus.ACTIVE, TripStatus.COMPLETED]:
            raise InvalidTripStatusException(trip.status.value, "actualizar")
        
        for key, value in trip_data.model_dump(exclude_unset=True).items():
            setattr(trip, key, value)
        
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip_id} actualizado")
        return trip
    
    def delete_trip(self, trip_id: int) -> None:
        """
        Elimina un viaje (solo si está en estado CREATED).
        
        Args:
            trip_id: ID del viaje
        
        Raises:
            TripNotFoundException si el viaje no existe
            InvalidTripStatusException si el estado no permite eliminación
        """
        trip = self.get_trip(trip_id)
        
        if trip.status != TripStatus.CREATED:
            raise InvalidTripStatusException(trip.status.value, "eliminar")
        
        self.db.delete(trip)
        self.db.commit()
        
        logger.info(f"Viaje {trip_id} eliminado")
    
    # ==================== Lifecycle ====================
    
    def start_trip(self, trip_id: int, start_data: TripStartRequest) -> Trip:
        """
        Inicia un viaje.
        
        Cambios:
        - Estado: CREATED → ACTIVE
        - Registra ubicación inicial
        - Registra hora de inicio real
        - Emite evento trip.started
        
        Args:
            trip_id: ID del viaje
            start_data: Datos de inicio (ubicación inicial)
        
        Returns:
            Trip actualizado
        
        Raises:
            TripNotFoundException si el viaje no existe
            InvalidTripStatusException si no está en estado CREATED
        """
        trip = self.get_trip(trip_id)
        
        if trip.status != TripStatus.CREATED:
            raise InvalidTripStatusException(trip.status.value, "iniciar")
        
        # Actualizar estado
        trip.status = TripStatus.ACTIVE
        trip.actual_start_time = datetime.now()
        trip.current_latitude = start_data.initial_latitude
        trip.current_longitude = start_data.initial_longitude
        trip.last_location_update = datetime.now()
        
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip_id} iniciado")
        
        # Publicar evento CRÍTICO
        if self.event_publisher:
            self.event_publisher.publish_trip_started(trip)
        
        return trip
    
    def complete_trip(self, trip_id: int, complete_data: TripCompleteRequest) -> Trip:
        """
        Completa un viaje exitosamente.
        
        Cambios:
        - Estado: ACTIVE → COMPLETED
        - Registra ubicación final
        - Registra hora de finalización
        - Marca pasajeros abordados como COMPLETED
        - Emite evento trip.completed
        
        Args:
            trip_id: ID del viaje
            complete_data: Datos de finalización (ubicación final)
        
        Returns:
            Trip actualizado
        
        Raises:
            TripNotFoundException si el viaje no existe
            InvalidTripStatusException si no está en estado ACTIVE
        """
        trip = self.get_trip(trip_id)
        
        if trip.status != TripStatus.ACTIVE:
            raise InvalidTripStatusException(trip.status.value, "completar")
        
        # Actualizar estado
        trip.status = TripStatus.COMPLETED
        trip.actual_end_time = datetime.now()
        trip.current_latitude = complete_data.final_latitude
        trip.current_longitude = complete_data.final_longitude
        trip.last_location_update = datetime.now()
        
        # Marcar pasajeros como completados
        for passenger in trip.passengers:
            if passenger.status == PassengerStatus.BOARDED:
                passenger.status = PassengerStatus.COMPLETED
                passenger.completed_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip_id} completado")
        
        # Publicar evento CRÍTICO
        if self.event_publisher:
            self.event_publisher.publish_trip_completed(trip)
        
        return trip
    
    def cancel_trip(self, trip_id: int, reason: str) -> Trip:
        """
        Cancela un viaje.
        
        Args:
            trip_id: ID del viaje
            reason: Razón de la cancelación
        
        Returns:
            Trip actualizado
        
        Raises:
            TripNotFoundException si el viaje no existe
            InvalidTripStatusException si ya está completado o cancelado
        """
        trip = self.get_trip(trip_id)
        
        if trip.status in [TripStatus.COMPLETED, TripStatus.CANCELLED]:
            raise InvalidTripStatusException(trip.status.value, "cancelar")
        
        trip.status = TripStatus.CANCELLED
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip_id} cancelado: {reason}")
        
        # Publicar evento
        if self.event_publisher:
            self.event_publisher.publish_trip_cancelled(trip, reason)
        
        return trip
    
    def update_location(self, trip_id: int, location: TripLocationUpdate) -> Trip:
        """
        Actualiza la ubicación actual del viaje.
        Solo viajes activos pueden actualizar ubicación.
        
        Args:
            trip_id: ID del viaje
            location: Nueva ubicación GPS
        
        Returns:
            Trip actualizado
        
        Raises:
            TripNotFoundException si el viaje no existe
            InvalidTripStatusException si no está en estado ACTIVE
        """
        trip = self.get_trip(trip_id)
        
        if trip.status != TripStatus.ACTIVE:
            raise InvalidTripStatusException(trip.status.value, "actualizar ubicación")
        
        trip.current_latitude = location.latitude
        trip.current_longitude = location.longitude
        trip.last_location_update = datetime.now()
        
        self.db.commit()
        self.db.refresh(trip)
        
        # No loggeamos cada actualización de ubicación (demasiado verbose)
        
        return trip
    
    # ==================== Queries ====================
    
    def get_active_trip_by_driver(self, driver_id: int) -> Optional[Trip]:
        """
        Obtiene el viaje activo de un conductor.
        
        CRÍTICO: WebSocket Gateway usa este método.
        
        Args:
            driver_id: ID del conductor
        
        Returns:
            Trip activo o None
        """
        return self.db.query(Trip).filter(
            and_(
                Trip.driver_id == driver_id,
                Trip.status == TripStatus.ACTIVE
            )
        ).first()
    
    def get_active_trips_by_route(self, route_id: int) -> List[Trip]:
        """
        Obtiene todos los viajes activos de una ruta.
        
        Args:
            route_id: ID de la ruta
        
        Returns:
            Lista de trips activos
        """
        return self.db.query(Trip).filter(
            and_(
                Trip.route_id == route_id,
                Trip.status == TripStatus.ACTIVE
            )
        ).all()
    
    def get_upcoming_trips(
        self, 
        hours_ahead: int = 24, 
        route_id: Optional[int] = None
    ) -> List[Trip]:
        """
        Obtiene viajes programados en las próximas N horas.
        
        Args:
            hours_ahead: Horas hacia adelante
            route_id: Filtrar por ruta (opcional)
        
        Returns:
            Lista de trips programados
        """
        now = datetime.now()
        future = now + timedelta(hours=hours_ahead)
        
        query = self.db.query(Trip).filter(
            and_(
                Trip.scheduled_start_time >= now,
                Trip.scheduled_start_time <= future,
                Trip.status == TripStatus.CREATED
            )
        )
        
        if route_id:
            query = query.filter(Trip.route_id == route_id)
        
        return query.order_by(Trip.scheduled_start_time).all()