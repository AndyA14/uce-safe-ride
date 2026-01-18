from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.models import Trip, TripPassenger, PassengerStatus, TripStatus
from app.schemas.passengers import TripPassengerCreate, PassengerBoardRequest
from app.core.exceptions import (
    TripNotFoundException, TripFullException,
    PassengerAlreadyInTripException, InvalidTripStatusException
)
from app.services.event_publisher import EventPublisher


class PassengerService:
    """Servicio para gestión de pasajeros en viajes"""
    
    def __init__(self, db: Session, event_publisher: EventPublisher = None):
        self.db = db
        self.event_publisher = event_publisher
    
    def add_passenger(self, trip_id: int, passenger_data: TripPassengerCreate) -> TripPassenger:
        """
        Agrega un pasajero a un viaje.
        Valida que el viaje no esté lleno y que el estudiante no esté ya en el viaje.
        """
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise TripNotFoundException(trip_id)
        
        # Validar estado del viaje
        if trip.status not in [TripStatus.CREATED, TripStatus.ACTIVE]:
            raise InvalidTripStatusException(trip.status.value, "agregar pasajeros")
        
        # Validar capacidad
        if trip.is_full:
            raise TripFullException(trip_id)
        
        # Validar que el estudiante no esté ya en el viaje
        existing = self.db.query(TripPassenger).filter(
            TripPassenger.trip_id == trip_id,
            TripPassenger.student_id == passenger_data.student_id
        ).first()
        
        if existing:
            raise PassengerAlreadyInTripException(passenger_data.student_id, trip_id)
        
        # Crear pasajero
        passenger = TripPassenger(
            trip_id=trip_id,
            student_id=passenger_data.student_id,
            stop_id=passenger_data.stop_id,
            fare_amount=passenger_data.fare_amount,
            status=PassengerStatus.RESERVED
        )
        
        self.db.add(passenger)
        
        # Incrementar contador de pasajeros
        trip.current_passenger_count += 1
        
        self.db.commit()
        self.db.refresh(passenger)
        
        # Publicar evento
        if self.event_publisher:
            self.event_publisher.publish_passenger_joined(passenger, trip)
        
        return passenger
    
    def get_passenger(self, trip_id: int, passenger_id: int) -> TripPassenger:
        """Obtiene un pasajero específico"""
        passenger = self.db.query(TripPassenger).filter(
            TripPassenger.trip_id == trip_id,
            TripPassenger.id == passenger_id
        ).first()
        
        if not passenger:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pasajero {passenger_id} no encontrado en viaje {trip_id}"
            )
        
        return passenger
    
    def list_passengers(self, trip_id: int) -> List[TripPassenger]:
        """Lista todos los pasajeros de un viaje"""
        return self.db.query(TripPassenger).filter(
            TripPassenger.trip_id == trip_id
        ).all()
    
    def board_passenger(
        self, 
        trip_id: int, 
        passenger_id: int, 
        board_data: PassengerBoardRequest
    ) -> TripPassenger:
        """
        Marca un pasajero como abordado.
        Solo se puede abordar si el viaje está activo.
        """
        passenger = self.get_passenger(trip_id, passenger_id)
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        
        if trip.status != TripStatus.ACTIVE:
            raise InvalidTripStatusException(trip.status.value, "abordar pasajeros")
        
        if passenger.status != PassengerStatus.RESERVED:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El pasajero no puede abordar en estado {passenger.status.value}"
            )
        
        passenger.status = PassengerStatus.BOARDED
        passenger.boarded_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(passenger)
        
        # Publicar evento
        if self.event_publisher:
            self.event_publisher.publish_passenger_boarded(passenger, trip)
        
        return passenger
    
    def remove_passenger(self, trip_id: int, passenger_id: int, reason: str) -> None:
        """
        Elimina un pasajero del viaje.
        Solo se puede eliminar si está en estado RESERVED.
        """
        passenger = self.get_passenger(trip_id, passenger_id)
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        
        if passenger.status not in [PassengerStatus.RESERVED, PassengerStatus.NO_SHOW]:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No se puede eliminar pasajero en estado {passenger.status.value}"
            )
        
        # Publicar evento antes de eliminar
        if self.event_publisher:
            self.event_publisher.publish_passenger_removed(passenger, trip, reason)
        
        self.db.delete(passenger)
        
        # Decrementar contador
        trip.current_passenger_count -= 1
        
        self.db.commit()
    
    def get_student_trips(self, student_id: int, active_only: bool = False) -> List[TripPassenger]:
        """Obtiene todos los viajes de un estudiante"""
        query = self.db.query(TripPassenger).filter(
            TripPassenger.student_id == student_id
        )
        
        if active_only:
            query = query.join(Trip).filter(
                Trip.status == TripStatus.ACTIVE
            )
        
        return query.all()
