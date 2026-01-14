from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.db.base import Base
from app.db.models import Stop  # Asegura que los modelos se registren
from shared.db.session import wait_for_db, engine


def create_app() -> FastAPI:
    app = FastAPI(
        title="Stop Service",
        version="1.0.0"
    )

    # Configuración de CORS
    origins = (
        [o.strip() for o in settings.CORS_ORIGINS.split(",")]
        if settings.CORS_ORIGINS
        else ["*"]
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Incluir routers
    app.include_router(v1_router, prefix="/api/v1")

    # Evento de startup
    @app.on_event("startup")
    async def startup_event():
        wait_for_db()  # Espera a que la DB esté lista
        Base.metadata.create_all(bind=engine)

    return app


app = create_app()
