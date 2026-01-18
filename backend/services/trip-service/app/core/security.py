# app/core/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional, List
from app.core.config import settings

security = HTTPBearer()


class TokenData:
    """Datos extraídos del token JWT"""
    def __init__(self, user_id: int, role: str, email: str):
        self.user_id = user_id
        self.role = role
        self.email = email


def decode_token(token: str) -> TokenData:
    """
    Decodifica y valida un token JWT.
    Lanza HTTPException si el token es inválido.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        user_id: int = payload.get("sub")
        role: str = payload.get("role")
        email: str = payload.get("email")
        
        if user_id is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: datos incompletos"
            )
        
        return TokenData(user_id=int(user_id), role=role, email=email)
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}"
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    Dependency para obtener el usuario actual desde el token.
    """
    return decode_token(credentials.credentials)


async def require_role(
    allowed_roles: List[str],
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """
    Dependency factory para verificar roles específicos.
    """
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Rol requerido: {', '.join(allowed_roles)}"
        )
    return current_user


# Helpers específicos por rol
async def get_current_driver(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """Verifica que el usuario sea conductor"""
    if current_user.role != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo conductores pueden realizar esta acción"
        )
    return current_user


async def get_current_student(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """Verifica que el usuario sea estudiante"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo estudiantes pueden realizar esta acción"
        )
    return current_user


async def get_current_admin(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """Verifica que el usuario sea administrador"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden realizar esta acción"
        )
    return current_user