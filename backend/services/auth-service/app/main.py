from fastapi import FastAPI
from app.api.v1.router import router as v1_router
from app.db.init_db import init_db
from app.core.config import settings

def create_app() -> FastAPI:
    app = FastAPI(title=settings.SERVICE_NAME)
    app.include_router(v1_router, prefix="/api/v1")

    @app.on_event("startup")
    def _startup():
        init_db()

    return app

app = create_app()
