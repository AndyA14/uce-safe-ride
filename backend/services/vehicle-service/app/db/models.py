# vehicle-service/app/db/models.py
import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base

# =========================
# VEHICLE MODEL
# =========================
class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    plate = Column(String, unique=True, nullable=False, index=True)
    model = Column(String, nullable=True)
    vehicle_type = Column(String, nullable=False)  # BUS | MINIBUS
    capacity = Column(Integer, nullable=False)

    status = Column(String, nullable=False, default="AVAILABLE")
    is_active = Column(Boolean, default=True)

    # ID del conductor (auth / users service)
    driver_id = Column(UUID(as_uuid=True), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relación: 1 vehículo → muchos pasajeros
    passengers = relationship(
        "Passenger",
        back_populates="vehicle",
        cascade="all, delete-orphan"
    )


# =========================
# PASSENGER MODEL
# =========================
class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Relación con vehículo
    vehicle_id = Column(
        UUID(as_uuid=True),
        ForeignKey("vehicles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    student_user_id = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, default="ON_BOARD")
    start_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    end_time = Column(DateTime, nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    vehicle = relationship("Vehicle", back_populates="passengers")
