from app.db.base import Base
from app.db.session import engine
from app.db import models  # noqa


def init_db():
    Base.metadata.create_all(bind=engine)
