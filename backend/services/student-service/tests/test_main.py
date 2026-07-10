import os
import uuid
from unittest.mock import MagicMock

# --- 1. CONFIGURACIÓN DEL ENTORNO ---
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Importaciones de tu student-service
from app.services.vehicle_client import get_vehicle_client 
from app.api.deps import get_current_user  
from app.main import app
from app.db.init_db import get_db
from app.db.models import Base

# Creamos el usuario simulado con un UUID nativo para que SQLAlchemy no arroje error
TEST_USER = {"user_id": uuid.uuid4(), "role": "STUDENT", "sub": "test@uce.edu.ec"}

# Mock del cliente de vehículos
mock_vehicle_client = MagicMock()
mock_vehicle_client.get_vehicles_by_student.return_value = [] 

# --- 2. CONFIGURACIÓN DE BASE DE DATOS EN MEMORIA ---
engine = create_engine(
    "sqlite:///:memory:", 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try: 
        yield db
    finally: 
        db.close()

# --- 3. INYECCIÓN DE DEPENDENCIAS NATIVA DE FASTAPI ---
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_vehicle_client] = lambda: mock_vehicle_client
# FastAPI inyectará a TEST_USER directamente
app.dependency_overrides[get_current_user] = lambda: TEST_USER

# Añadimos un token falso en los headers para pasar cualquier filtro HTTPBearer
client = TestClient(app, headers={"Authorization": "Bearer token-falso-para-tests"})

# --- 4. PRUEBAS ---
def test_get_me():
    """Prueba la obtención del perfil del estudiante"""
    response = client.get("/api/v1/students/me")
    assert response.status_code == 200
    # Comparamos el JSON (string) con nuestra variable UUID (convertida a string)
    assert response.json()["auth_user_id"] == str(TEST_USER["user_id"])

def test_add_favourite():
    """Prueba la adición de una ruta favorita"""
    payload = {"route_id": str(uuid.uuid4()), "alias": "Casa"}
    response = client.post("/api/v1/students/me/favourites", json=payload)
    assert response.status_code == 201
    assert response.json()["status"] == "created"