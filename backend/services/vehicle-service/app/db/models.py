import uuid
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    # 🆔 Identificador único (UUID)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # 🔑 Relación con el Estudiante (Del primer código)
    # Esto es CRUCIAL para que 'student-service' encuentre sus vehículos
    student_user_id = Column(String, index=True, nullable=False)

    # 🚙 Datos del Vehículo
    plate = Column(String, unique=True, nullable=False, index=True)
    model = Column(String, nullable=True)  # Agregado del primer código (útil para mostrar "Toyota Coaster")
    vehicle_type = Column(String, nullable=False)  # BUS | MINIBUS | VAN
    capacity = Column(Integer, nullable=False)
    
    # 🚦 Estado y Control
    status = Column(String, nullable=False, default="AVAILABLE")  # AVAILABLE | IN_ROUTE | FULL | MAINTENANCE
    is_active = Column(Boolean, default=True) # Del primer código (útil para borrado lógico)

    # 🕒 Auditoría
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)