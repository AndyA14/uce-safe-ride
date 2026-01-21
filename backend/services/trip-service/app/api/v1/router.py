from fastapi import APIRouter
from app.api.v1.endpoints import trips, trip_lifecycle, passengers, health,tracking

api_router = APIRouter()

api_router.include_router(
    trips.router,
    prefix="/trips",
    tags=["Trips"]
)
api_router.include_router(
    tracking.router, 
    tags=["Tracking"])


api_router.include_router(
    trip_lifecycle.router,
    prefix="/trips",
    tags=["Trip Lifecycle"]
)

api_router.include_router(
    passengers.router,
    prefix="/trips",
    tags=["Passengers"]
)


api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"]
)
