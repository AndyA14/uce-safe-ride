from fastapi import FastAPI
from app.db.session import Base, engine
from app.db import models 
from app.api.v1.router import router

app = FastAPI(title="Tracking Service")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(router)

