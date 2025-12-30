from sqlalchemy.orm import Session

from app.db.base import Base
from app.db import models  # noqa: F401 (importa modelos para registrar tablas)
from shared.db.session import engine


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
