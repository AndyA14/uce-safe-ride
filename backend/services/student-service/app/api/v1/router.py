from fastapi import APIRouter
from app.api.v1.endpoints import health, student

router = APIRouter()
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(student.router, prefix="/students", tags=["students"])
