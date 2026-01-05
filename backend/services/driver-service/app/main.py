from fastapi import FastAPI
from app.api.v1.router import router
from app.db.session import engine
from app.db import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Driver Service")

app.include_router(router)
