from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from typing import Optional
from jose import jwt, JWTError
from pydantic import BaseModel
import logging

from app.core.config import settings
from app.services.trip_service import TripService
from app.api.v1.endpoints.dependencies import get_trip_service
# 🟢 IMPORTANTE: Importamos el manager global
from app.core.socket_manager import manager

router = APIRouter()
logger = logging.getLogger(__name__)

# -------------------------------------------------------------------------
# MODELO LOCAL DE DATOS
# -------------------------------------------------------------------------
class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# -------------------------------------------------------------------------
# VALIDACIÓN MANUAL DE TOKEN
# -------------------------------------------------------------------------
def validate_token_ws(token: str) -> Optional[TokenData]:
    try:
        secret = settings.SECRET_KEY or settings.JWT_SECRET_KEY
        payload = jwt.decode(
            token,
            secret,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER or "uce-safe-ride"
        )
        return TokenData(username=payload.get("sub"), role=payload.get("role"))
    except JWTError as e:
        logger.error(f"❌ Error validando token WS: {e}")
        return None

# -------------------------------------------------------------------------
# ENDPOINT WEBSOCKET (MODO REAL)
# -------------------------------------------------------------------------
@router.websocket("/ws/trips")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    trip_id: int = Query(..., description="ID del viaje real a rastrear"),
    trip_service: TripService = Depends(get_trip_service)
):
    # 1. Validar Token
    user = validate_token_ws(token)
    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Conectar al Manager (Suscripción al viaje real)
    await websocket.accept()
    await manager.connect(websocket, trip_id)
    
    logger.info(f"🟢 Usuario {user.username} escuchando actualizaciones del viaje {trip_id}")

    try:
        while True:
            # BUCLE DE ESPERA:
            # Aquí ya no generamos datos falsos.
            # Solo mantenemos la conexión abierta esperando que 'socket_manager'
            # nos empuje datos cuando el conductor llame al endpoint PATCH.
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, trip_id)
        logger.info(f"🔴 Usuario {user.username} desconectado del viaje {trip_id}")
    except Exception as e:
        logger.error(f"🔥 Error en socket: {e}")
        manager.disconnect(websocket, trip_id)