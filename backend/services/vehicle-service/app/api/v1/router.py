from fastapi import APIRouter
from app.api.v1.endpoints import health, vehicles

router = APIRouter()
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
