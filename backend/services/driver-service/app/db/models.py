from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from app.db.session import Base


class DriverStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_ROUTE = "ON_ROUTE"
    OFFLINE = "OFFLINE"


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auth_user_id = Column(UUID(as_uuid=True), unique=True, nullable=False)

    name = Column(String(100), nullable=False)
    ci = Column(String(13), unique=True, nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)

    status = Column(
        Enum(DriverStatus, name="driver_status"),
        nullable=False,
        default=DriverStatus.OFFLINE,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
