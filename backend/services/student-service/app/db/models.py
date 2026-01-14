import uuid
from datetime import datetime

from sqlalchemy import (
    String,
    DateTime,
    Integer,
    Float,
    Boolean,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


# ------------------------------------------------------------------
# STUDENT PROFILE
# ------------------------------------------------------------------
class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    auth_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        index=True,
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    full_name: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )


# ------------------------------------------------------------------
# STUDENT CUSTOM ROUTE
# ------------------------------------------------------------------
class StudentCustomRoute(Base):
    __tablename__ = "student_custom_routes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    student_user_id: Mapped[str] = mapped_column(
        String,
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    origin_lat: Mapped[float] = mapped_column(Float, nullable=False)
    origin_lng: Mapped[float] = mapped_column(Float, nullable=False)

    destination_lat: Mapped[float] = mapped_column(Float, nullable=False)
    destination_lng: Mapped[float] = mapped_column(Float, nullable=False)

    polyline: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


# ------------------------------------------------------------------
# FAVOURITE ROUTES
# ------------------------------------------------------------------
class FavouriteRoute(Base):
    __tablename__ = "favourite_routes"

    __table_args__ = (
        UniqueConstraint(
            "student_user_id",
            "route_id",
            name="uq_fav_student_route",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    student_user_id: Mapped[str] = mapped_column(
        String,
        index=True,
        nullable=False,
    )

    route_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        index=True,
        nullable=False,
    )

    alias: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


# ------------------------------------------------------------------
# ROUTE USAGE
# ------------------------------------------------------------------
class RouteUsage(Base):
    __tablename__ = "route_usage"

    __table_args__ = (
        UniqueConstraint(
            "student_user_id",
            "route_id",
            name="uq_usage_student_route",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    student_user_id: Mapped[str] = mapped_column(
        String,
        index=True,
        nullable=False,
    )

    route_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        index=True,
        nullable=False,
    )

    usage_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
