from fastapi import APIRouter, Depends, HTTPException
from app.models.jwt_forwarding import forward_jwt_to_service, verify_jwt
from app.models.schemas import UserProfileResponse

router = APIRouter()

# Endpoint para obtener el perfil de un usuario (estudiante o conductor)
@router.get("/user-profile", response_model=UserProfileResponse)
async def get_user_profile(token: str = Depends(verify_jwt)):
    """
    Obtiene el perfil del usuario (puede ser estudiante o conductor) usando el JWT token.
    """
    # Reenvía el JWT al servicio correspondiente para obtener el perfil
    user_profile = await forward_jwt_to_service("http://student-service/api/v1/students/me", token)
    
    if not user_profile:
        # Si no es un perfil de estudiante, intenta buscar en el Driver Service
        user_profile = await forward_jwt_to_service("http://driver-service/api/v1/drivers/me", token)

    if not user_profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    return user_profile

# Otras rutas de usuarios (por ejemplo, login) pueden ir aquí
