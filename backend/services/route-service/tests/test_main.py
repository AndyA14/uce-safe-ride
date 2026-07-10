import os
import sys
import uuid
from unittest.mock import MagicMock, patch

# --- 1. MOCKS DE KAFKA (PREVENCIÓN DE CONEXIÓN) ---
mock_producer = MagicMock()
sys.modules['kafka'] = MagicMock()
sys.modules['kafka.KafkaProducer'] = mock_producer

# --- 2. CONFIGURACIÓN DEL ENTORNO ---
with patch('app.core.kafka_producer.KafkaProducer', return_value=mock_producer):
    DIRECTORIO_BACKEND = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
    sys.path.insert(0, DIRECTORIO_BACKEND)
    
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    
    from fastapi.testclient import TestClient
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool
    
    from app.main import app
    from app.db.sessions import get_db
    from app.db.models import Base
    
    # --- 3. INYECCIÓN DIRECTA DE MOCKS DE SEGURIDAD ---
    import app.api.v1.endpoints.dependencies as deps_module
    import app.core.security as security_module
    
    TEST_USER = {"user_id": str(uuid.uuid4()), "role": "STUDENT", "sub": "test-uuid"}
    
    # Sobrescribimos funciones reales con mocks
    deps_module.get_current_user = MagicMock(return_value=TEST_USER)
    security_module.get_current_principal = MagicMock(return_value=TEST_USER)

# --- 4. CONFIGURACIÓN DE DB Y CLIENTE ---
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
client = TestClient(app)

# --- 5. PRUEBAS ---
def test_list_routes():
    """Prueba que el endpoint de listar rutas funcione correctamente"""
    response = client.get("/api/v1/routes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_start_route():
    """Prueba el inicio de una ruta (usando mock de servicio)"""
    # 1. Ajustamos el retorno para que sea consistente con lo que devuelve el endpoint
    with patch("app.services.route_service.start_route", return_value={"message": "Route started"}):
        response = client.post("/api/v1/routes/test-id/start")
        
        assert response.status_code == 200
        # 2. Ajustamos la clave que buscamos en el assert
        assert response.json()["message"] == "Route started"