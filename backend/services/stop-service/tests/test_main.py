import os
import sys
import uuid
from unittest.mock import MagicMock

# --- 1. CONFIGURACIÓN DEL ENTORNO ---
DIRECTORIO_BACKEND = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
sys.path.insert(0, DIRECTORIO_BACKEND)
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

# --- 2. MOCK DE SEGURIDAD (Evita errores de inyección) ---
# Mockeamos el módulo antes de importar app
import app.core.security as security_module
TEST_USER = {"user_id": str(uuid.uuid4()), "role": "ADMIN", "sub": "test-uuid"}

# Definimos una función que cumple con lo que FastAPI espera de una dependencia
def mock_require_role(*args, **kwargs):
    def _dep(principal: dict = TEST_USER):
        return principal
    return _dep

security_module.require_role = mock_require_role

# --- 3. IMPORTACIONES ---
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.db.session import get_db
from app.db.models import Base, Stop

# --- 4. CONFIGURACIÓN DB ---
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try: yield db
    finally: db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# --- 5. PRUEBAS ---
def test_create_stop():
    """Prueba la creación exitosa de una parada"""
    # Enviamos los datos envueltos en 'data'
    payload = {
        "data": {
            "name": "Parada Central UCE",
            "latitude": -0.200,
            "longitude": -78.500
        }
    }
    response = client.post("/api/v1/stops", json=payload)
    assert response.status_code == 201
    assert response.json()["name"] == "Parada Central UCE"
    
def test_list_stops():
    db = TestingSessionLocal()
    db.add(Stop(name="Parada Norte", latitude=0.0, longitude=0.0, active=True))
    db.commit()
    response = client.get("/api/v1/stops")
    assert response.status_code == 200