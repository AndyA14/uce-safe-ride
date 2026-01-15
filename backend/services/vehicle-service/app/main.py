from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shared.db.session import wait_for_db
from app.api.v1.router import router as v1_router
from app.db.init_db import init_db


def create_app() -> FastAPI:
    app = FastAPI(
        title="Vehicle Service",
        description="Servicio de gestión de vehículos y pasajeros",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",  
            "http://localhost:3000",  
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ✅ Registrar router principal
    app.include_router(v1_router)

    @app.on_event("startup")
    def startup():
        print("\n" + "="*60)
        print("🚀 VEHICLE SERVICE INICIANDO")
        print("="*60)
        
        wait_for_db()
        init_db()
        
        print("\n📍 RUTAS REGISTRADAS:")
        print("-"*60)
        for route in app.routes:
            if hasattr(route, 'methods') and hasattr(route, 'path'):
                methods = list(route.methods)
                print(f"  {methods[0]:6} {route.path}")
        print("="*60 + "\n")

    return app


app = create_app()