import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, index=True, unique=True)  # sub del JWT
    email: Mapped[str] = mapped_column(String, index=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FavouriteRoute(Base):
    __tablename__ = "favourite_routes"
    __table_args__ = (
        UniqueConstraint("student_user_id", "route_id", name="uq_fav_student_route"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_user_id: Mapped[str] = mapped_column(String, index=True)   # user_id (sub)
    route_id: Mapped[str] = mapped_column(String, index=True)          # id de Route (string)
    alias: Mapped[str | None] = mapped_column(String, nullable=True)   # "Casa -> UCE"

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RouteUsage(Base):
    __tablename__ = "route_usage"
    __table_args__ = (
        UniqueConstraint("student_user_id", "route_id", name="uq_usage_student_route"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_user_id: Mapped[str] = mapped_column(String, index=True)
    route_id: Mapped[str] = mapped_column(String, index=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)