from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    Enum,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base

# ============================================================
# ENUMS
# ============================================================

class TripStatus(str, enum.Enum):
    """Estados posibles de un viaje"""
    CREATED = "CREATED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PassengerStatus(str, enum.Enum):
    """Estados de un pasajero en el viaje"""
    RESERVED = "RESERVED"
    BOARDED = "BOARDED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"

# ============================================================
# TRIP MODEL
# ============================================================

class Trip(Base):
    """
    Representa la ejecución REAL de una ruta.
    Fuente de verdad para tracking, pagos y WebSocket.
    """
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)

    # Referencias
    route_id = Column(String, nullable=False, index=True)
    driver_id = Column(String, nullable=False, index=True)
    vehicle_id = Column(String, nullable=False, index=True)

    # Estado
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

    # Ubicación actual
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    last_location_update = Column(DateTime(timezone=True), nullable=True)

    # Capacidad
    max_passengers = Column(Integer, nullable=False, default=40)
    current_passenger_count = Column(Integer, default=0)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # RELACIÓN CON PASAJEROS
    passengers = relationship(
        "Passenger",
        back_populates="trip",
        cascade="all, delete-orphan"
    )

    # Índices
    __table_args__ = (
        Index("idx_trip_driver_status", "driver_id", "status"),
        Index("idx_trip_route_status", "route_id", "status"),
        Index("idx_trip_scheduled_time", "scheduled_start_time"),
    )

    def __repr__(self):
        return (
            f"<Trip(id={self.id}, route={self.route_id}, "
            f"driver={self.driver_id}, status={self.status})>"
        )

    @property
    def is_active(self) -> bool:
        return self.status == TripStatus.ACTIVE

    @property
    def is_full(self) -> bool:
        return self.current_passenger_count >= self.max_passengers

    @property
    def available_seats(self) -> int:
        return max(0, self.max_passengers - self.current_passenger_count)


# ============================================================
# PASSENGER MODEL  
# ============================================================

class Passenger(Base):
    """
    Representa a un estudiante dentro de un viaje específico.
    Maneja reserva, abordaje y pago.
    """
    __tablename__ = "passengers"

    id = Column(Integer, primary_key=True, index=True)

    # Referencias
    trip_id = Column(
        Integer,
        ForeignKey("trips.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    student_id = Column(String, nullable=False, index=True)
    stop_id = Column(String, nullable=True)

    # Estado
    status = Column(
        Enum(PassengerStatus),
        default=PassengerStatus.RESERVED,
        nullable=False,
        index=True
    )

    # Información de pago
    fare_amount = Column(Float, default=0.25, nullable=False)
    payment_id = Column(String, nullable=True)
    payment_status = Column(String, default="PENDING")

    # Tiempos
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    boarded_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relación inversa
    trip = relationship("Trip", back_populates="passengers")

    # Índices - 🟢 RENOMBRADOS PARA EVITAR CONFLICTO DE ARRANQUE
    __table_args__ = (
        Index("idx_passenger_trip_student_v2", "trip_id", "student_id", unique=True),
        Index("idx_passenger_student_status_v2", "student_id", "status"),
    )

    def __repr__(self):
        return (
            f"<Passenger(id={self.id}, trip={self.trip_id}, "
            f"student={self.student_id}, status={self.status})>"
        )

    @property
    def is_boarded(self) -> bool:
        return self.status == PassengerStatus.BOARDED