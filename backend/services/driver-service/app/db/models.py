import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.session import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    license_number = Column(String, nullable=False, unique=True)
    phone = Column(String, nullable=False)
    status = Column(String, nullable=False, default="AVAILABLE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
