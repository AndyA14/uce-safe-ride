from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from shared.db.session import wait_for_db
from app.api.v1.router import router as v1_router
from app.db.init_db import init_db


def create_app() -> FastAPI:
    app = FastAPI(title="Auth Service")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],   # GET, POST, PUT, DELETE, OPTIONS
        allow_headers=["*"],   # Authorization, Content-Type, etc
    )

    # Routers
    app.include_router(v1_router, prefix="/api/v1")

    # Startup events
    @app.on_event("startup")
    async def startup_event():
        wait_for_db()
        init_db()

    return app


app = create_app()






