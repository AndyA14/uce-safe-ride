from fastapi import APIRouter, Depends, HTTPException
import httpx
from app.core.config import settings

router = APIRouter()

# URL del Driver Service (asegúrate de que esté correctamente configurada)
DRIVER_SERVICE_URL = f"http://driver-service:{settings.DRIVER_SERVICE_PORT}"

# 3️⃣ Obtener perfil del conductor
@router.get("/me")
async def get_my_driver(credentials: dict = Depends()):
    """Obtener el perfil del conductor (delegado a Driver Service)"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DRIVER_SERVICE_URL}/me", headers={"Authorization": f"Bearer {credentials['access_token']}"})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Driver profile not found")
        return response.json()

# 4️⃣ Actualizar perfil del conductor
@router.put("/me")
async def update_my_driver(data: dict, credentials: dict = Depends()):
    """Actualizar el perfil del conductor (delegado a Driver Service)"""
    async with httpx.AsyncClient() as client:
        response = await client.put(f"{DRIVER_SERVICE_URL}/me", json=data, headers={"Authorization": f"Bearer {credentials['access_token']}"})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to update driver profile")
        return response.json()

# 5️⃣ Actualizar estado del conductor
@router.patch("/me/status")
async def update_driver_status(status_data: dict, credentials: dict = Depends()):
    """Actualizar estado del conductor (delegado a Driver Service)"""
    async with httpx.AsyncClient() as client:
        response = await client.patch(f"{DRIVER_SERVICE_URL}/me/status", json=status_data, headers={"Authorization": f"Bearer {credentials['access_token']}"})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to update driver status")
        return response.json()
