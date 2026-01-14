import httpx
from fastapi import HTTPException, Request, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Any

# Este es un ejemplo básico para verificar el JWT y reenviarlo a un microservicio
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Función que valida el JWT
async def verify_jwt(token: str = Depends(oauth2_scheme)) -> str:
    # Aquí puedes agregar la lógica de validación del JWT
    # Por ejemplo, puedes usar PyJWT para verificar el token
    try:
        # Validación o decodificación del token (puedes personalizar esto con tu librería de JWT)
        # jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# Función que hace el forwarding del JWT hacia otros servicios (por ejemplo, Student Service)
async def forward_jwt_to_service(url: str, token: str, params: dict = None) -> Any:
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error forwarding the JWT to service.")
        
        return response.json()
