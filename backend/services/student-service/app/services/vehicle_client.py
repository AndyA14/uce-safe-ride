import httpx
from fastapi import HTTPException
from app.core.config import settings

class VehicleClient:
    def __init__(self):
        self.base_url = getattr(settings, "VEHICLE_SERVICE_URL", "http://vehicle-service:8000/api/v1")

    async def get_vehicles_by_student(self, student_id: str, token: str):
        url = f"{self.base_url}/vehicles/student/{student_id}"
        
        headers = {"Authorization": f"Bearer {token}"}

        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(url, headers=headers)

                if response.status_code == 200:
                    return response.json()
                
                if response.status_code == 404:
                    return []

                print(f"Error Vehicle Service: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=502,
                    detail="Vehicle service error"
                )

            except httpx.RequestError as e:
                print(f"Connection Error: {e}")
                raise HTTPException(
                    status_code=503,
                    detail="Vehicle service unavailable"
                )

def get_vehicle_client() -> VehicleClient:
    return VehicleClient()