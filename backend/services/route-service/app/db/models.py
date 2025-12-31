import uuid
from sqlalchemy import String, Boolean, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class Route(Base):
    __tablename__ = "routes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)  # "OUTBOUND" / "INBOUND"
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    stops = relationship("RouteStop", back_populates="route", cascade="all, delete-orphan")

class Stop(Base):
    __tablename__ = "stops"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    latitude: Mapped[float] = mapped_column(nullable=False)
    longitude: Mapped[float] = mapped_column(nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    routes = relationship("RouteStop", back_populates="stop", cascade="all, delete-orphan")

class RouteStop(Base):
    __tablename__ = "route_stops"
    __table_args__ = (
        UniqueConstraint("route_id", "stop_id", name="uq_route_stop"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    route_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("routes.id"), nullable=False)
    stop_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("stops.id"), nullable=False)

    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    route = relationship("Route", back_populates="stops")
    stop = relationship("Stop", back_populates="routes")
