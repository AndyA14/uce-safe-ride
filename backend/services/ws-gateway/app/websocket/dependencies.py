from fastapi import WebSocket, Query, status
from app.core.jwt import validate_token 
from shared.security.jwt import validate_token


async def get_current_user_ws(
    websocket: WebSocket, 
    token: str = Query(...) 
):
    payload = validate_token(token)
    
    if not payload:
        print("⛔ Conexión WS rechazada: Token inválido")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None
        
    return payload