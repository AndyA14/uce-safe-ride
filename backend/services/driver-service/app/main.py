from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- IMPORTAR ESTO
from app.api.v1.endpoints import drivers
from app.db.session import engine, Base

# Crear tablas (si usas este método)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Driver Service")

# --- CONFIGURACIÓN CORS (AGREGAR ESTO) ---
origins = [
    "http://localhost:5173",  # Tu Frontend Vite
    "http://127.0.0.1:5173",
    "*"                       # Permitir todo (útil para desarrollo)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------

app.include_router(drivers.router, prefix="/api/v1/drivers", tags=["drivers"])


