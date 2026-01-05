import uuid
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    plate = Column(String, unique=True, nullable=False, index=True)

    vehicle_type = Column(String, nullable=False)  # BUS | MINIBUS | VAN
    capacity = Column(Integer, nullable=False)

    status = Column(String, nullable=False, default="AVAILABLE")  # AVAILABLE | IN_ROUTE | FULL | MAINTENANCE

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


