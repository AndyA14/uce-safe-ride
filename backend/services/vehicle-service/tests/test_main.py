import os
import uuid
from unittest.mock import MagicMock

# --- 1. CONFIGURACIÓN DEL ENTORNO ---
os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/testdb"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# --- 2. MOCK DE SEGURIDAD ANTES DE IMPORTAR LA APP ---
import app.core.security as security_module

TEST_USER = {"user_id": str(uuid.uuid4()), "role": "ADMIN", "sub": "admin@uce.edu.ec"}

def mock_require_role(roles: list):
    def _dep(user: dict = TEST_USER):
        return user
    return _dep

security_module.require_role = mock_require_role

# --- 3. IMPORTACIONES DE LA APP ---
from app.main import app
from app.db.sessions import get_db
from app.db.models import Base

# --- 4. CONFIGURACIÓN DB EN MEMORIA ---
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

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app, headers={"Authorization": "Bearer token-falso"})

# --- 5. PRUEBAS ---
BASE_PATH = "/api/v1/vehicles"

def test_create_and_list_vehicle():
    """Prueba la creación de un vehículo y luego listarlo"""
    payload = {
        "plate": f"UCE-{str(uuid.uuid4())[:4]}", 
        "model": "Bus Volvo 2020",
        "capacity": 40,
        "vehicle_type": "BUS",
        "status": "AVAILABLE"
    }
    
    response_create = client.post(f"{BASE_PATH}/", json={"payload": payload})
    assert response_create.status_code == 201
    
    response_list = client.get(f"{BASE_PATH}/")
    assert response_list.status_code == 200
    assert len(response_list.json()) >= 1


def test_board_and_leave_vehicle():
    """Prueba que un estudiante pueda subirse y bajarse del vehículo"""
    payload = {
        "plate": f"UCE-{str(uuid.uuid4())[:4]}",
        "model": "Van Mercedes",
        "capacity": 15,
        "vehicle_type": "BUS",
        "status": "AVAILABLE"
    }
    v_response = client.post(f"{BASE_PATH}/", json={"payload": payload})
    assert v_response.status_code == 201
    vehicle_id = v_response.json()["id"]
    
    board_response = client.post(f"{BASE_PATH}/{vehicle_id}/board")
    assert board_response.status_code == 200
    assert board_response.json()["status"] == "ON_BOARD"
    
    leave_response = client.post(f"{BASE_PATH}/{vehicle_id}/leave")
    assert leave_response.status_code == 200
    assert "exitosamente" in leave_response.json()["message"]