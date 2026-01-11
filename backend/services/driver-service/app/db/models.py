from sqlalchemy import Column, String, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.db.session import Base

class DriverStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_ROUTE = "ON_ROUTE"
    OFFLINE = "OFFLINE"

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)  
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    ci = Column(String, unique=True, nullable=False, index=True) 
    license_number = Column(String, unique=True, nullable=False, index=True)  
    phone = Column(String, nullable=True)
    status = Column(SQLEnum(DriverStatus), default=DriverStatus.AVAILABLE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Driver {self.name} ({self.email})>"