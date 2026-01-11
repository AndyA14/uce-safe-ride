from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings # Asegúrate de haber creado config.py en el paso anterior

# Esto le dice a Swagger UI dónde buscar el botón de "Authorize"
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    1. Recibe el Token del Header 'Authorization: Bearer ...'
    2. Intenta desencriptarlo usando la CLAVE SECRETA compartida.
    3. Si es válido, extrae el ID del usuario.
    """
    token = credentials.credentials
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # DECODIFICACIÓN: Aquí es donde ocurre la magia.
        # Si la firma no coincide con JWT_SECRET_KEY, esto fallará y lanzará JWTError.
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        user_id: str = payload.get("sub") # 'sub' suele guardar el ID del usuario
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    # Creamos una clase simple para devolver el usuario con su ID.
    # Esto permite que en tus endpoints uses "current_user.id"
    class UserRef:
        def __init__(self, id):
            self.id = id

    return UserRef(id=user_id)