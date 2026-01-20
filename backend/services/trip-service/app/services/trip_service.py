
from click import Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from datetime import datetime, timedelta
from typing import List, Optional,Tuple
import logging

from app.db.models import Trip
from app.schemas.trips import (
    TripCreate, TripUpdate, TripStatus,
    TripStartRequest, TripCompleteRequest,
    TripLocationUpdate, TripFilterParams
)
from app.services.event_publisher import EventPublisher
from app.services.validation_service import ValidationService
from app.core.exceptions import (
    TripNotFoundException,
    TripAlreadyActiveException,
    InvalidTripStatusException
)

logger = logging.getLogger(__name__)


class TripService:
    """
    Servicio de lógica de negocio para gestión de viajes.
    """
    
    def __init__(
        self, 
        db: Session, 
        event_publisher: EventPublisher = None, 
        validation_service: ValidationService = None
    ):
        self.db = db
        self.event_publisher = event_publisher
        self.validation_service = validation_service or ValidationService()

    # ==================== CRUD ====================
    
    def create_trip(self, trip_data: TripCreate, token: str = None) -> Trip:
        """
        Crea un nuevo viaje.
        ✅ THESIS MODE: Validaciones externas comentadas
        
        Args:
            trip_data: Datos del viaje a crear
            token: Token JWT (opcional, para validaciones externas)
        """
        logger.info(
            f"Creando viaje: route={trip_data.route_id}, "
            f"driver={trip_data.driver_id}, vehicle={trip_data.vehicle_id}"
        )
        
        # 🎓 THESIS MODE: Validaciones externas desactivadas
        # if self.validation_service and token:
        #     await self.validation_service.validate_trip_creation(
        #         route_id=trip_data.route_id,
        #         driver_id=trip_data.driver_id,
        #         vehicle_id=trip_data.vehicle_id,
        #         token=token
        #     )
        
        # Verificar que el conductor no tenga viajes activos
        existing_active = self.db.query(Trip).filter(
            and_(
                Trip.driver_id == trip_data.driver_id,
                Trip.status.in_([TripStatus.CREATED.value, TripStatus.ACTIVE.value])
            )
        ).first()
        
        if existing_active:
            logger.warning(
                f"Conductor {trip_data.driver_id} ya tiene viaje activo: {existing_active.id}"
            )
            raise TripAlreadyActiveException(trip_data.driver_id)
        
        # Crear el viaje
        trip = Trip(
            route_id=trip_data.route_id,
            driver_id=trip_data.driver_id,
            vehicle_id=trip_data.vehicle_id,
            scheduled_start_time=trip_data.scheduled_start_time,
            max_passengers=trip_data.max_passengers,
            status=TripStatus.CREATED.value,  # ✅ Usar .value
            current_passenger_count=0
        )
        
        self.db.add(trip)
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip.id} creado exitosamente")
        
        # Publicar evento
        if self.event_publisher:
            from app.schemas.events import TripCreatedEvent
            event = TripCreatedEvent(
                trip_id=trip.id,
                route_id=str(trip.route_id),
                driver_id=str(trip.driver_id),
                vehicle_id=str(trip.vehicle_id),
                scheduled_start_time=trip.scheduled_start_time.isoformat(),
                max_passengers=trip.max_passengers,
                status=trip.status
            )
            self.event_publisher.publish_trip_created(event)
        
        return trip
    
    def get_trip(self, trip_id: int) -> Optional[Trip]:
        """Obtiene un viaje por ID"""
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            logger.warning(f"Viaje {trip_id} no encontrado")
            raise TripNotFoundException(trip_id)
        return trip
    def list_trips(self, filters: TripFilterParams) -> Tuple[List[Trip], int]:

        query = self.db.query(Trip)

        # Filtros dinámicos
        if filters.driver_id:
            query = query.filter(Trip.driver_id == filters.driver_id)

        if filters.vehicle_id:
            query = query.filter(Trip.vehicle_id == filters.vehicle_id)

        if filters.route_id:
            query = query.filter(Trip.route_id == filters.route_id)

        # Si status es None, no se filtra
        if filters.status:
            query = query.filter(Trip.status == filters.status)

        # Total antes de paginar
        total = query.count()

        # Paginación
        skip = (filters.page - 1) * filters.page_size

        items = (
            query.order_by(desc(Trip.scheduled_start_time))
                .offset(skip)
                .limit(filters.page_size)
                .all()
        )

        return items, total

    def update_trip(self, trip_id: int, update_data: TripUpdate) -> Trip:
        """Actualiza información básica del viaje"""
        trip = self.get_trip(trip_id)
        
        if trip.status in [TripStatus.ACTIVE.value, TripStatus.COMPLETED.value]:
            raise InvalidTripStatusException(trip.status, "actualizar")
        
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(trip, field, value)
        
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip_id} actualizado")
        return trip
    
    def delete_trip(self, trip_id: int) -> None:
        """Elimina un viaje (solo si está en estado CREATED)"""
        trip = self.get_trip(trip_id)
        
        if trip.status != TripStatus.CREATED.value:
            raise InvalidTripStatusException(trip.status, "eliminar")
        
        self.db.delete(trip)
        self.db.commit()
        
        logger.info(f"Viaje {trip_id} eliminado")
    
    # ==================== Lifecycle (✅ RESTAURADO) ====================
    
    def start_trip(self, trip_id: int, start_data: TripStartRequest) -> Trip:
        """Inicia un viaje"""
        trip = self.get_trip(trip_id)
        
        if trip.status != TripStatus.CREATED.value:
            raise InvalidTripStatusException(trip.status, "iniciar")
        
        trip.status = TripStatus.ACTIVE.value
        trip.actual_start_time = datetime.now()
        
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip_id} iniciado")
        
        if self.event_publisher:
            from app.schemas.events import TripStartedEvent, LocationData
            event = TripStartedEvent(
                trip_id=trip.id,
                route_id=str(trip.route_id),
                driver_id=str(trip.driver_id),
                vehicle_id=str(trip.vehicle_id),
                actual_start_time=trip.actual_start_time.isoformat(),
                initial_location=LocationData(
                    latitude=start_data.initial_latitude,
                    longitude=start_data.initial_longitude
                ),
                status=trip.status
            )
            self.event_publisher.publish_trip_started(event)
        
        return trip
    
    def complete_trip(self, trip_id: int, complete_data: TripCompleteRequest) -> Trip:
        """Completa un viaje"""
        trip = self.get_trip(trip_id)
        
        if trip.status != TripStatus.ACTIVE.value:
            raise InvalidTripStatusException(trip.status, "completar")
        
        trip.status = TripStatus.COMPLETED.value
        trip.actual_end_time = datetime.now()
        
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip_id} completado")
        
        if self.event_publisher:
            from app.schemas.events import TripCompletedEvent, LocationData
            event = TripCompletedEvent(
                trip_id=trip.id,
                route_id=str(trip.route_id),
                driver_id=str(trip.driver_id),
                vehicle_id=str(trip.vehicle_id),
                actual_start_time=trip.actual_start_time.isoformat() if trip.actual_start_time else None,
                actual_end_time=trip.actual_end_time.isoformat(),
                passenger_count=trip.current_passenger_count,
                final_location=LocationData(
                    latitude=complete_data.final_latitude,
                    longitude=complete_data.final_longitude
                ),
                status=trip.status
            )
            self.event_publisher.publish_trip_completed(event)
        
        return trip
    
    def cancel_trip(self, trip_id: int, reason: str) -> Trip:
        """Cancela un viaje"""
        trip = self.get_trip(trip_id)
        
        if trip.status in [TripStatus.COMPLETED.value, TripStatus.CANCELLED.value]:
            raise InvalidTripStatusException(trip.status, "cancelar")
        
        trip.status = TripStatus.CANCELLED.value
        self.db.commit()
        self.db.refresh(trip)
        
        logger.info(f"Viaje {trip_id} cancelado: {reason}")
        
        if self.event_publisher:
            from app.schemas.events import TripCancelledEvent
            event = TripCancelledEvent(
                trip_id=trip.id,
                route_id=str(trip.route_id),
                driver_id=str(trip.driver_id),
                reason=reason,
                status=trip.status
            )
            self.event_publisher.publish_trip_cancelled(event)
        
        return trip
    
    def update_location(self, trip_id: int, location: TripLocationUpdate) -> Trip:
        """Actualiza la ubicación del viaje"""
        trip = self.get_trip(trip_id)
        
        if trip.status != TripStatus.ACTIVE.value:
            raise InvalidTripStatusException(trip.status, "actualizar ubicación")
        
        # Aquí podrías actualizar campos de ubicación si existen en el modelo
        # trip.current_latitude = location.latitude
        # trip.current_longitude = location.longitude
        
        self.db.commit()
        self.db.refresh(trip)
        
        return trip
    
    # ==================== Queries (✅ RESTAURADAS TODAS) ====================
    
    def get_active_trip_by_driver(self, driver_id: str) -> Optional[Trip]:
        """
        Obtiene el viaje activo de un conductor.
        """
        return self.db.query(Trip).filter(
            and_(
                Trip.driver_id == driver_id,
                Trip.status == TripStatus.ACTIVE.value
            )
        ).first()
    
    def get_active_trips_by_route(self, route_id: str) -> List[Trip]:
        """
        Obtiene todos los viajes activos de una ruta.
        """
        return self.db.query(Trip).filter(
            and_(
                Trip.route_id == route_id,
                Trip.status == TripStatus.ACTIVE.value
            )
        ).all()
    
    def get_upcoming_trips(
        self, 
        hours_ahead: int = 24, 
        route_id: Optional[str] = None
    ) -> List[Trip]:
        """
        ✅ RESTAURADO: Obtiene viajes programados en las próximas N horas.
        """
        now = datetime.now()
        future = now + timedelta(hours=hours_ahead)
        
        query = self.db.query(Trip).filter(
            and_(
                Trip.scheduled_start_time >= now,
                Trip.scheduled_start_time <= future,
                Trip.status == TripStatus.CREATED.value
            )
        )
        
        if route_id:
            query = query.filter(Trip.route_id == route_id)
        
        return query.order_by(Trip.scheduled_start_time.asc()).all()
