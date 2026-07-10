import os
import sys
from unittest.mock import MagicMock
from bson import ObjectId

# --- 1. EXPANDIMOS EL RADAR PARA LA CARPETA 'SHARED' Y 'DB' ---
DIRECTORIO_BACKEND = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
sys.path.insert(0, DIRECTORIO_BACKEND)

# --- 2. EL TRUCO MAESTRO: SIMULAR KAFKA Y MONGODB ---
mock_kafka = MagicMock()
mock_kafka_errors = MagicMock()
mock_kafka_errors.NoBrokersAvailable = Exception 

sys.modules['kafka'] = mock_kafka
sys.modules['kafka.errors'] = mock_kafka_errors
sys.modules['app.messaging.kafka.consumer'] = MagicMock()

mock_collection = MagicMock()
mock_mongo_module = MagicMock()
mock_mongo_module.notifications_collection = mock_collection
sys.modules['db.mongo'] = mock_mongo_module
sys.modules['app.db.mongo'] = mock_mongo_module

# --- 3. AHORA SÍ, IMPORTAMOS TU APP ---
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

PREFIX = "/api/v1/notifications"

# --- PRUEBAS UNITARIAS ---

def test_create_notification():
    """Prueba la inserción de un documento en MongoDB"""
    fake_id = ObjectId()
    
    mock_insert_result = MagicMock()
    mock_insert_result.inserted_id = fake_id
    mock_collection.insert_one.return_value = mock_insert_result
    
    mock_collection.find_one.return_value = {
        "_id": fake_id,
        "recipient_id": "usuario-test-123",
        "title": "Alerta UCE",
        "message": "Tu viaje ha comenzado",
        "created_at": "2026-07-08T10:00:00"
    }
    
    payload = {
        "recipient_id": "usuario-test-123",
        "title": "Alerta UCE",
        "message": "Tu viaje ha comenzado"
    }
    
    response = client.post(f"{PREFIX}/", json=payload)
    
    # Indentación corregida a 4 espacios
    assert response.status_code == 200
    assert response.json()["title"] == "Alerta UCE"
    assert response.json()["recipient_id"] == "usuario-test-123"
    mock_collection.insert_one.assert_called_once()

def test_get_notification_success():
    """Prueba la búsqueda exitosa de una notificación por ID"""
    fake_id = ObjectId()
    
    mock_collection.find_one.return_value = {
        "_id": fake_id,
        "recipient_id": "usuario-test-123",
        "title": "Alerta UCE",
        "message": "Tu viaje ha comenzado"
    }
    
    response = client.get(f"{PREFIX}/{str(fake_id)}")
    
    assert response.status_code == 200
    assert response.json()["title"] == "Alerta UCE"
    assert response.json()["recipient_id"] == "usuario-test-123"

def test_get_notification_not_found():
    """Prueba el manejo de errores cuando MongoDB no encuentra nada"""
    mock_collection.find_one.return_value = None
    
    fake_id = ObjectId()
    response = client.get(f"{PREFIX}/{str(fake_id)}")
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"