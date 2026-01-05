from fastapi import FastAPI
from shared.db.session import wait_for_db
from app.api.v1.router import router as v1_router
from app.db.init_db import init_db

def create_app() -> FastAPI:
    app = FastAPI(title="Vehicle Service")
    app.include_router(v1_router)

    @app.on_event("startup")
    def startup():
        wait_for_db()
        init_db()

    return app

app = create_app()
