from fastapi import FastAPI
from app.routers import register

app = FastAPI(title="UCE Safe Ride API Gateway")

app.include_router(register.router, prefix="/api", tags=["Register"])
