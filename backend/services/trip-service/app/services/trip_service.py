from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
import logging

from app.db.models import Trip, Passenger
from app.schemas.trips import (
    TripCreate, 
    TripUpdate, 
    TripStatus,
    TripStartRequest, 
    TripCompleteRequest,
    TripLocationUpdate, 
    TripFilterParams,
    PassengerCreate 
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
        """Crea un nuevo viaje."""
        logger.info(f"Creando viaje: route={trip_data.route_id}, driver={trip_data.driver_id}")
        
        # Verificar que el conductor no tenga viajes activos
        existing_active = self.db.query(Trip).filter(
            and_(
                Trip.driver_id == trip_data.driver_id,
                Trip.status.in_([TripStatus.CREATED.value, TripStatus.ACTIVE.value])
            )
        ).first()
        
        if existing_active:
            raise TripAlreadyActiveException(trip_data.driver_id)
        
        trip = Trip(
            route_id=trip_data.route_id,
            driver_id=trip_data.driver_id,
            vehicle_id=trip_data.vehicle_id,
            scheduled_start_time=trip_data.scheduled_start_time,
            max_passengers=trip_data.max_passengers,
            status=TripStatus.CREATED.value,
            current_passenger_count=0
        )
        
        self.db.add(trip)
        self.db.commit()
        self.db.refresh(trip)
        
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
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise TripNotFoundException(trip_id)
        return trip

    def list_trips(self, filters: TripFilterParams) -> Tuple[List[Trip], int]:
        query = self.db.query(Trip)

        if filters.driver_id:
            query = query.filter(Trip.driver_id == filters.driver_id)
        if filters.vehicle_id:
            query = query.filter(Trip.vehicle_id == filters.vehicle_id)
        if filters.route_id:
            query = query.filter(Trip.route_id == filters.route_id)
        if filters.status:
            query = query.filter(Trip.status == filters.status)

        total = query.count()
        skip = (filters.page - 1) * filters.page_size
        items = query.order_by(desc(Trip.scheduled_start_time)).offset(skip).limit(filters.page_size).all()

        return items, total

    def update_trip(self, trip_id: int, update_data: TripUpdate) -> Trip:
        trip = self.get_trip(trip_id)
        if trip.status in [TripStatus.ACTIVE.value, TripStatus.COMPLETED.value]:
            raise InvalidTripStatusException(trip.status, "actualizar")
        
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(trip, field, value)
        
        self.db.commit()
        self.db.refresh(trip)
        return trip
    
    def delete_trip(self, trip_id: int) -> None:
        trip = self.get_trip(trip_id)
        if trip.status != TripStatus.CREATED.value:
            raise InvalidTripStatusException(trip.status, "eliminar")
        
        self.db.delete(trip)
        self.db.commit()
    
    # ==================== Lifecycle ====================
    
    def start_trip(self, trip_id: int):
        trip = self.get_trip(trip_id)
        trip.actual_start_time = datetime.utcnow()
        trip.status = "ACTIVE"
        self.db.commit()
        return trip
    
    def complete_trip(self, trip_id: int) -> Trip:
        trip = self.get_trip(trip_id)

        if trip.status != TripStatus.ACTIVE.value:
            raise InvalidTripStatusException(trip.status, "completar")

        trip.status = TripStatus.COMPLETED.value
        trip.actual_end_time = datetime.utcnow()

        self.db.commit()
        self.db.refresh(trip)

        # 🔔 Evento de dominio (opcional pero recomendado)
        if self.event_publisher:
            from app.schemas.events import TripCompletedEvent, LocationData

            event = TripCompletedEvent(
                trip_id=trip.id,
                route_id=str(trip.route_id),
                driver_id=str(trip.driver_id),
                vehicle_id=str(trip.vehicle_id),
                actual_start_time=(
                    trip.actual_start_time.isoformat()
                    if trip.actual_start_time
                    else None
                ),
                actual_end_time=trip.actual_end_time.isoformat(),
                passenger_count=trip.current_passenger_count,
                # 📍 Ubicación final tomada del último estado conocido
                final_location=LocationData(
                    latitude=trip.current_latitude,
                    longitude=trip.current_longitude,
                ),
                status=trip.status,
            )
            self.event_publisher.publish_trip_completed(event)
            return trip

    def cancel_trip(self, trip_id: int, reason: str) -> Trip:
        trip = self.get_trip(trip_id)
        
        if trip.status in [TripStatus.COMPLETED.value, TripStatus.CANCELLED.value]:
            raise InvalidTripStatusException(trip.status, "cancelar")
        
        trip.status = TripStatus.CANCELLED.value
        self.db.commit()
        self.db.refresh(trip)
        
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
        trip = self.get_trip(trip_id)
        if trip.status != TripStatus.ACTIVE.value:
            raise InvalidTripStatusException(trip.status, "actualizar ubicación")
        
        # Actualizar campos de ubicación si existen
        trip.current_latitude = location.latitude
        trip.current_longitude = location.longitude
        
        self.db.commit()
        self.db.refresh(trip)
        return trip
    
    # ==================== Queries & Pasajeros ====================
    
    def get_active_trip_by_driver(self, driver_id: str) -> Optional[Trip]:
        return self.db.query(Trip).filter(
            and_(
                Trip.driver_id == driver_id,
                Trip.status == TripStatus.ACTIVE.value
            )
        ).first()
    
    def get_active_trip_by_route(self, db: Session, route_id: str):
        # 🟢 CORRECCIÓN: Eliminamos "BOARDING" porque no es un TripStatus válido en Postgres
        return db.query(Trip).filter(
            Trip.route_id == route_id,
            Trip.status.in_([
                TripStatus.CREATED.value, 
                TripStatus.ACTIVE.value
            ])
        ).order_by(Trip.id.desc()).first()
    
    def add_passenger(self, db: Session, trip_id: int, passenger_data: PassengerCreate):
        """Registra un pasajero en el viaje y emite evento a Kafka"""
        trip = self.get_trip(trip_id)
        
        # Validaciones
        if trip.status not in [TripStatus.CREATED.value, TripStatus.ACTIVE.value]:
             raise InvalidTripStatusException(trip.status, "subir pasajeros")
             
        if trip.current_passenger_count >= trip.max_passengers:
            raise ValueError("El bus está lleno")

        # Crear Pasajero
        passenger = Passenger(
            trip_id=trip.id,
            student_id=passenger_data.student_id,
            status="BOARDED",
            fare_amount=passenger_data.fare_amount,
            boarded_at=datetime.now()
        )
        db.add(passenger)
        
        # Actualizar Contador
        trip.current_passenger_count += 1
        db.commit()
        db.refresh(passenger)
        
        logger.info(f"Pasajero {passenger.student_id} subió al viaje {trip.id}")

        # Publicar Evento Genérico a Kafka
        if self.event_publisher:
            event_payload = {
                "event_type": "passenger.boarded",
                "data": {
                    "trip_id": trip.id,
                    "route_id": str(trip.route_id),
                    "student_id": passenger.student_id,
                    "passenger_count": trip.current_passenger_count
                }
            }
            self.event_publisher.publish(event_payload)
            
        return passenger

    def get_upcoming_trips(self, hours_ahead: int = 24, route_id: Optional[str] = None) -> List[Trip]:
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