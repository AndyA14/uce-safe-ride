import os
import uuid
from unittest.mock import patch

# 1. Evitamos que SQLAlchemy colapse por variables vacías
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

# 2. Generamos un UUID como OBJETO real, no como texto
TEST_UUID_OBJ = uuid.uuid4()

# 3. Interceptamos require_role enviando el objeto UUID
def fake_auth_dependency():
    return {"user_id": TEST_UUID_OBJ, "roles": ["DRIVER", "ADMIN"]}

patch("app.api.deps.require_role", return_value=fake_auth_dependency).start()

# Importamos todo lo necesario
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool  # <-- LA CLAVE PARA SQLITE EN MEMORIA

from app.main import app
from app.db.session import get_db
from app.db.models import Base, Driver

# --- CONFIGURACIÓN DE LA BASE DE DATOS TEMPORAL ---
# Usamos StaticPool para evitar que SQLite borre la memoria entre conexiones
engine = create_engine(
    "sqlite:///:memory:", 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool  # <-- ESTO EVITA EL ERROR "no such table"
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ahora la tabla se crea y se mantiene viva
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# --- TUS PRUEBAS UNITARIAS ---

def test_create_driver():
    """Cubre el endpoint POST / (Crear conductor)"""
    payload = {
        "auth_user_id": str(TEST_UUID_OBJ),  # En el JSON de la petición sí va como string
        "name": "Piloto Prueba",
        "phone": "0999999999",
        "ci": "1700000000",
        "license_number": "LIC-12345"
    }
    response = client.post("/api/v1/drivers", json=payload)
    
    assert response.status_code == 201
    assert response.json()["name"] == "Piloto Prueba"

def test_get_my_driver():
    """Cubre el endpoint GET /me"""
    response = client.get("/api/v1/drivers/me")
    assert response.status_code == 200
    assert response.json()["name"] == "Piloto Prueba"

def test_list_drivers():
    """Cubre el endpoint GET / (Listar conductores)"""
    response = client.get("/api/v1/drivers")
    assert response.status_code == 200
    assert type(response.json()) == list

@patch("app.api.v1.endpoints.drivers.publish_notification")
def test_bus_near_stop(mock_publish):
    """Cubre el endpoint de RabbitMQ"""
    response = client.post("/api/v1/drivers/routes/ruta-1/near-stop?student_id=est-1")
    assert response.status_code == 200
    mock_publish.assert_called_once()