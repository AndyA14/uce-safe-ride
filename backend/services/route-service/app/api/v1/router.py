from fastapi import APIRouter
from app.api.v1.endpoints import health, routes


router = APIRouter()
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(routes.router, prefix="/routes", tags=["routes"])

