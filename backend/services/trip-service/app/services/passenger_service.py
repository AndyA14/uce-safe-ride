
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import logging

from app.db.models import Trip, TripPassenger
from app.schemas.passengers import (
    TripPassengerCreate, 
    PassengerBoardRequest, 
    PassengerStatus
)
from app.schemas.trips import TripStatus
from app.core.exceptions import (
    TripNotFoundException, 
    TripFullException,
    PassengerAlreadyInTripException, 
    InvalidTripStatusException
)
from app.services.event_publisher import EventPublisher
from app.services.validation_service import ValidationService

logger = logging.getLogger(__name__)


class PassengerService:
    """
    Servicio para gestión de pasajeros en viajes.
    ✅ THESIS MODE: Validaciones externas comentadas
    """
    
    def __init__(
        self, 
        db: Session, 
        event_publisher: EventPublisher = None, 
        validation_service: ValidationService = None
    ):
        self.db = db
        self.event_publisher = event_publisher
        self.validation_service = validation_service

    def add_passenger(
        self, 
        trip_id: int, 
        passenger_data: TripPassengerCreate
    ) -> TripPassenger:
        """
        Agrega un pasajero a un viaje.
        ✅ RESTAURADO: Validación de estados
        """
        # 1. Verificar que el viaje existe
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise TripNotFoundException(trip_id)

        # 2. ✅ RESTAURADO: Validación de estado del viaje
        # Convertir el enum a string de forma segura
        status_str = str(trip.status.value) if hasattr(trip.status, 'value') else str(trip.status)
        
        allowed_statuses = [
            TripStatus.CREATED.value,
            TripStatus.ACTIVE.value
        ]

        if status_str not in allowed_statuses:
            logger.warning(
                f"Intento de agregar pasajero a viaje {trip_id} en estado {status_str}"
            )
            raise InvalidTripStatusException(
                status_str, 
                "agregar pasajeros"
            )

        # 3. Verificar capacidad
        current_count = trip.current_passenger_count or 0
        if current_count >= trip.max_passengers:
            raise TripFullException(trip_id)

        # 4. Verificar duplicados
        existing = self.db.query(TripPassenger).filter(
            TripPassenger.trip_id == trip_id,
            TripPassenger.student_id == passenger_data.student_id
        ).first()
        
        if existing:
            raise PassengerAlreadyInTripException(
                passenger_data.student_id, 
                trip_id
            )

        # 🎓 THESIS MODE: Validaciones externas comentadas
        # if self.validation_service:
        #     await self.validation_service.validate_student_exists(...)
        #     await self.validation_service.validate_stop_exists(...)

        # 5. Crear pasajero
        passenger = TripPassenger(
            trip_id=trip_id,
            student_id=passenger_data.student_id,
            stop_id=passenger_data.stop_id,
            fare_amount=passenger_data.fare_amount,
            status=PassengerStatus.RESERVED.value
        )
        
        self.db.add(passenger)
        
        # 6. Incrementar contador
        trip.current_passenger_count = current_count + 1
        
        self.db.commit()
        self.db.refresh(passenger)

        logger.info(
            f"Pasajero {passenger.id} agregado al viaje {trip_id} "
            f"(estudiante: {passenger_data.student_id})"
        )

        # 7. Publicar evento
        if self.event_publisher:
            self.event_publisher.publish_passenger_joined(passenger, trip)
        
        return passenger

    def list_passengers(self, trip_id: int) -> List[TripPassenger]:
        """Lista todos los pasajeros de un viaje"""
        return self.db.query(TripPassenger).filter(
            TripPassenger.trip_id == trip_id
        ).all()

    def get_passenger(self, trip_id: int, passenger_id: int) -> TripPassenger:
        """Obtiene un pasajero específico"""
        passenger = self.db.query(TripPassenger).filter(
            TripPassenger.trip_id == trip_id, 
            TripPassenger.id == passenger_id
        ).first()
        
        if not passenger:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=404, 
                detail=f"Pasajero {passenger_id} no encontrado en viaje {trip_id}"
            )
        
        return passenger

    def board_passenger(
        self, 
        trip_id: int, 
        passenger_id: int, 
        board_data: PassengerBoardRequest
    ) -> TripPassenger:
        """Marca un pasajero como abordado"""
        passenger = self.get_passenger(trip_id, passenger_id)
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        
        # Validar que el viaje esté activo
        if trip.status != TripStatus.ACTIVE.value:
            raise InvalidTripStatusException(trip.status, "abordar pasajeros")
        
        # Validar que el pasajero esté reservado
        if passenger.status != PassengerStatus.RESERVED.value:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=400,
                detail=f"El pasajero no puede abordar en estado {passenger.status}"
            )
        
        passenger.status = PassengerStatus.BOARDED.value
        passenger.boarded_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(passenger)
        
        logger.info(f"Pasajero {passenger_id} abordó el viaje {trip_id}")
        
        if self.event_publisher:
            self.event_publisher.publish_passenger_boarded(passenger, trip)
        
        return passenger

    def get_student_trips(
        self, 
        student_id: str, 
        active_only: bool = False
    ) -> List[TripPassenger]:
        """Obtiene todos los viajes de un estudiante"""
        query = self.db.query(TripPassenger).filter(
            TripPassenger.student_id == student_id
        )
        
        if active_only:
            query = query.join(Trip).filter(
                Trip.status == TripStatus.ACTIVE.value
            )
        
        return query.all()

    def remove_passenger(
        self, 
        trip_id: int, 
        passenger_id: int, 
        reason: str
    ) -> None:
        """Elimina un pasajero del viaje"""
        passenger = self.get_passenger(trip_id, passenger_id)
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        
        if not trip:
            raise TripNotFoundException(trip_id)
        
        # Publicar evento antes de eliminar
        if self.event_publisher:
            self.event_publisher.publish_passenger_removed(passenger, trip, reason)
        
        # Eliminar pasajero
        self.db.delete(passenger)
        
        # Decrementar contador
        trip.current_passenger_count = max(0, trip.current_passenger_count - 1)
        
        self.db.commit()
        
        logger.info(f"Pasajero {passenger_id} eliminado del viaje {trip_id}: {reason}")
