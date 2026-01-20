from sqlalchemy import Column, String, Integer, Float, DateTime, Enum, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.db.base import Base


class TripStatus(str, enum.Enum):
    """Estados posibles de un viaje"""
    CREATED = "CREATED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PassengerStatus(str, enum.Enum):
    """Estados de un pasajero en el viaje"""
    RESERVED = "RESERVED"  # Reservó lugar pero no ha abordado
    BOARDED = "BOARDED"    # Ya abordó el vehículo
    COMPLETED = "COMPLETED"  # Completó el viaje
    NO_SHOW = "NO_SHOW"    # No se presentó


class Trip(Base):
    """
    Representa la ejecución REAL de una ruta.
    Es la fuente de verdad para tracking, payments y WebSocket.
    """
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    
  
    route_id = Column(String, nullable=False, index=True)
    driver_id = Column(String, nullable=False, index=True)
    vehicle_id = Column(String, nullable=False, index=True)

    
    # Estado del viaje
    status = Column(
        Enum(TripStatus),
        default=TripStatus.CREATED,
        nullable=False,
        index=True
    )
    
    # Tiempos
    scheduled_start_time = Column(DateTime(timezone=True), nullable=False)
    actual_start_time = Column(DateTime(timezone=True), nullable=True)
    estimated_end_time = Column(DateTime(timezone=True), nullable=True)
    actual_end_time = Column(DateTime(timezone=True), nullable=True)
    
    # Ubicación actual (cache para consultas rápidas)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    last_location_update = Column(DateTime(timezone=True), nullable=True)
    
    # Capacidad
    max_passengers = Column(Integer, nullable=False, default=40)
    current_passenger_count = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    passengers = relationship(
        "TripPassenger",
        back_populates="trip",
        cascade="all, delete-orphan"
    )
    
    # Índices compuestos para consultas comunes
    __table_args__ = (
        Index('idx_trip_driver_status', 'driver_id', 'status'),
        Index('idx_trip_route_active', 'route_id', 'status'),
        Index('idx_trip_scheduled_time', 'scheduled_start_time'),
    )
    
    def __repr__(self):
        return f"<Trip(id={self.id}, route={self.route_id}, driver={self.driver_id}, status={self.status})>"
    
    @property
    def is_active(self) -> bool:
        """Verifica si el viaje está activo"""
        return self.status == TripStatus.ACTIVE
    
    @property
    def is_full(self) -> bool:
        """Verifica si el viaje está lleno"""
        return self.current_passenger_count >= self.max_passengers
    
    @property
    def available_seats(self) -> int:
        """Retorna asientos disponibles"""
        return max(0, self.max_passengers - self.current_passenger_count)


class TripPassenger(Base):
    """
    Representa un estudiante en un viaje específico.
    Gestiona reservas, abordaje y tarifas.
    """
    __tablename__ = "trip_passengers"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Referencias
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    
    student_id = Column(String, nullable=False, index=True)

    stop_id = Column(Integer, nullable=False)  # Parada donde abordará/abordó (Asumimos ID numérico aquí)
    
    # Estado
    status = Column(
        Enum(PassengerStatus),
        default=PassengerStatus.RESERVED,
        nullable=False
    )
    
    # Tiempos
    reserved_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    boarded_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Información de pago
    fare_amount = Column(Float, nullable=False)
    payment_id = Column(String, nullable=True)  # Referencia al Payment Service
    payment_status = Column(String, default="PENDING")  # PENDING, COMPLETED, FAILED
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    trip = relationship("Trip", back_populates="passengers")
    
    # Índices
    __table_args__ = (
        Index('idx_passenger_trip_student', 'trip_id', 'student_id', unique=True),
        Index('idx_passenger_student_status', 'student_id', 'status'),
    )
    
    def __repr__(self):
        return f"<TripPassenger(trip={self.trip_id}, student={self.student_id}, status={self.status})>"
    
    @property
    def is_boarded(self) -> bool:
        """Verifica si el pasajero ya abordó"""
        return self.status == PassengerStatus.BOARDED