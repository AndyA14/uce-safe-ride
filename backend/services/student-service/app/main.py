from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from shared.db.session import wait_for_db, engine 
from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.db.base import Base 
from app.db.models import StudentProfile, FavouriteRoute, RouteUsage

def create_app() -> FastAPI:
    app = FastAPI(title="Student Service")

    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")] if settings.CORS_ORIGINS else ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(v1_router, prefix="/api/v1")

    @app.on_event("startup")
    def startup_event():
        wait_for_db()
        Base.metadata.create_all(bind=engine)
    return app

app = create_app()