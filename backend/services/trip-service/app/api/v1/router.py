from fastapi import APIRouter
from app.api.v1.endpoints import trips, trip_lifecycle, passengers, health,routes


api_router = APIRouter()

api_router.include_router(
    routes.router,
    prefix="/routes",  
    tags=["Routes"]
)


api_router.include_router(
    trips.router,
    prefix="/trips",
    tags=["Trips"]
)

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
