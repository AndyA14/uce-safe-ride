from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

security = HTTPBearer()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ISSUER = os.getenv("JWT_ISSUER", "uce-safe-ride")


def require_role(allowed_roles: list[str]):
    def dependency(
        credentials: HTTPAuthorizationCredentials = Depends(security),
    ):
        try:
            payload = jwt.decode(
                credentials.credentials,
                JWT_SECRET_KEY,
                algorithms=["HS256"],
                issuer=JWT_ISSUER,
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        role = payload.get("role")
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )

        return payload

    return dependency
