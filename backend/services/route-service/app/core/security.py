from typing import Optional, Dict, Any, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

from app.core.config import settings

bearer = HTTPBearer(auto_error=False)

def get_current_principal(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> Dict[str, Any]:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = creds.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            options={"require": ["exp", "iat", "sub"]},
        )
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    principal = {
        "user_id": payload.get("sub"),
        "role": (payload.get("role") or "").upper(),
        "iss": payload.get("iss"),
    }

    if not principal["user_id"] or not principal["role"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing required claims")

    return principal

def require_role(*allowed_roles: str) -> Callable:
    allowed = {r.upper() for r in allowed_roles}

    def _dep(principal: Dict[str, Any] = Depends(get_current_principal)) -> Dict[str, Any]:
        if principal["role"] not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return principal

    return _dep
