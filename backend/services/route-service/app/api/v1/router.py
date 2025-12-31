from fastapi import APIRouter
from app.api.v1.endpoints import health, routes, stops
from app.api.v1.endpoints import route_stops

router = APIRouter()
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(routes.router, prefix="/routes", tags=["routes"])
router.include_router(stops.router, prefix="/stops", tags=["stops"])
router.include_router(route_stops.router, tags=["route-stops"])
