import uuid
from sqlalchemy import Column, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.session import Base
from app.db.base import Base   


class TrackingPoint(Base):
    __tablename__ = "tracking_points"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    driver_id = Column(UUID(as_uuid=True), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    speed = Column(Float, nullable=True)
    heading = Column(Float, nullable=True)

    recorded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
