import os
import sys
import pytest
from unittest.mock import patch

# --- 1. EL TRUCO DE LAS RUTAS PARA MICROSERVICIOS ---
# Le decimos a Python que añada la carpeta raíz 'backend' a su radar
# Rutas: tests/ (1) -> auth-service/ (2) -> services/ (3) -> backend/
DIRECTORIO_BACKEND = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
sys.path.insert(0, DIRECTORIO_BACKEND)

# --- 2. INYECTAMOS VARIABLES DE ENTORNO ---
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["UCE_EMAIL_DOMAIN"] = "@uce.edu.ec"
os.environ["SECRET_KEY"] = "super-secreto-para-testing-jwt"

# --- 3. AHORA SÍ, IMPORTAMOS TU APLICACIÓN ---
# Python ya sabe qué es 'shared' y no dará error
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from shared.db.session import get_db
from app.models.user import User  # Importamos tu modelo

# --- CONFIGURACIÓN DE LA BASE DE DATOS TEMPORAL ---
engine = create_engine(
    "sqlite:///:memory:", 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

User.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# NOTA: Ajusta el prefijo "/api/v1/auth" si en tu main.py lo incluiste con otra ruta
PREFIX = "/api/v1/auth" 

# --- PRUEBAS DEL FLUJO DE AUTENTICACIÓN ---

def test_register_invalid_domain():
    """Prueba que el sistema rechace correos que no sean de la UCE"""
    payload = {
        "email": "hacker@gmail.com",
        "password": "password123",
        "role": "STUDENT"
    }
    response = client.post(f"{PREFIX}/register", json=payload)
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid UCE email"

def test_register_success():
    """Prueba el registro exitoso de un estudiante"""
    payload = {
        "email": "estudiante@uce.edu.ec",
        "password": "password123",
        "role": "STUDENT"
    }
    response = client.post(f"{PREFIX}/register", json=payload)
    
    assert response.status_code == 201
    assert "id" in response.json()
    assert response.json()["email"] == "estudiante@uce.edu.ec"

def test_register_duplicate():
    """Prueba que no se puedan crear dos cuentas con el mismo correo"""
    payload = {
        "email": "estudiante@uce.edu.ec",
        "password": "password123",
        "role": "STUDENT"
    }
    response = client.post(f"{PREFIX}/register", json=payload)
    
    assert response.status_code == 409
    assert response.json()["detail"] == "User already exists"

def test_login_and_verify_token():
    """Prueba el login y luego usa el token para acceder a una ruta protegida"""
    # 1. Hacemos Login
    login_payload = {
        "email": "estudiante@uce.edu.ec",
        "password": "password123"
    }
    login_response = client.post(f"{PREFIX}/login", json=login_payload)
    
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    assert token is not None

    # 2. Verificamos el Token
    headers = {"Authorization": f"Bearer {token}"}
    verify_response = client.post(f"{PREFIX}/verify-token", headers=headers)
    
    assert verify_response.status_code == 200
    assert verify_response.json()["valid"] is True
    assert verify_response.json()["payload"]["role"] == "STUDENT"