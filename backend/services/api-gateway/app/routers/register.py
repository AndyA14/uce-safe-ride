from fastapi import APIRouter, Depends, HTTPException, status
import httpx
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()

# URL del Auth Service (asegúrate de que esté correctamente configurada)
AUTH_SERVICE_URL = f"http://auth-service:{settings.AUTH_SERVICE_PORT}"

# Definición del modelo para las credenciales
class Credentials(BaseModel):
    username: str
    password: str

# Definición del modelo para el token
class Token(BaseModel):
    access_token: str

# 1️⃣ Endpoint de login en Auth Service
@router.post("/login")
async def login(data: Credentials):
    """Endpoint para el login (delegado a Auth Service)"""
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{AUTH_SERVICE_URL}/login", json=data.dict())
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Login failed")
        return response.json()

# 2️⃣ Endpoint para verificar el token JWT
@router.post("/verify-token")
async def verify_token(token: Token):
    """Verificación del token JWT (delegado a Auth Service)"""
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{AUTH_SERVICE_URL}/verify-token", json={"token": token.access_token})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Invalid token")
        return response.json()
