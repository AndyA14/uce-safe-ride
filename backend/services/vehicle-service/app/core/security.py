from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Optional, Set, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=True)


@dataclass
class Principal:
    user_id: str
    role: str


def _normalize_roles(
    allowed_roles: Union[str, Iterable[str], Iterable[Iterable[str]]]
) -> Set[str]:
    # Si viene un string directo
    if isinstance(allowed_roles, str):
        return {allowed_roles.upper()}

    # Si viene algo iterable (lista/tupla/set)
    normalized: List[str] = []
    for item in allowed_roles:
        # item puede ser "ADMIN" o ["ADMIN", ...]
        if isinstance(item, str):
            normalized.append(item)
        else:
            # item es iterable de strings (ej: ["ADMIN"])
            for sub in item:
                normalized.append(sub)

    return {r.upper() for r in normalized}


def get_current_principal(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Principal:
    token = creds.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    # Validaciones mínimas
    user_id: Optional[str] = payload.get("sub")
    role: Optional[str] = payload.get("role")
    issuer: Optional[str] = payload.get("iss")

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing required claims",
        )

    if getattr(settings, "JWT_ISSUER", None) and issuer != settings.JWT_ISSUER:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
        )

    return Principal(user_id=str(user_id), role=str(role).upper())


def require_role(allowed_roles: Union[str, Iterable[str], Iterable[Iterable[str]]]):
    allowed = _normalize_roles(allowed_roles)

    def _dep(principal: Principal = Depends(get_current_principal)) -> str:
        if principal.role.upper() not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden",
            )
        return principal.role

    return _dep
