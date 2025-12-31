from typing import Optional, Callable, Dict, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from jose import JWTError, jwt

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            options={"require": ["exp", "iat", "sub"]},
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def get_current_principal(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = credentials.credentials
    payload = decode_token(token)

    # normalizamos campos esperados
    principal = {
        "user_id": payload.get("sub"),
        "role": (payload.get("role") or "").upper(),
        "issuer": payload.get("iss"),
    }

    if not principal["user_id"] or not principal["role"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing required claims",
        )

    return principal


def require_role(*allowed_roles: str) -> Callable:
    allowed = {r.upper() for r in allowed_roles}

    def _dependency(principal: Dict[str, Any] = Depends(get_current_principal)) -> Dict[str, Any]:
        if principal["role"] not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return principal

    return _dependency
