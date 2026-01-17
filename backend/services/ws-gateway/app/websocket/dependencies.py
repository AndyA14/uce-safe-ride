from fastapi import WebSocket, Query, status
from jose import JWTError  # Necesario para capturar errores de token
from shared.security.jwt import decode_token 

async def get_current_user(
    websocket: WebSocket, 
    token: str = Query(None)
):

    if not token:
        print("⛔ Rechazado: Falta el token en la URL.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None

    try:
        payload = decode_token(token)
        
        if not payload:
            raise JWTError("Payload vacío")
            
        return payload

    except JWTError:
        print("⛔ Rechazado: Token inválido o expirado.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None