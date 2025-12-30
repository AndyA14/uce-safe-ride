from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from backend.shared.security.jwt import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_claims(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        return decode_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

def require_roles(*allowed_roles: str):
    allowed = {r.upper() for r in allowed_roles}

    def _guard(claims: dict = Depends(get_current_claims)) -> dict:
        role = str(claims.get("role", "")).upper()
        if role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient role. Required: {sorted(list(allowed))}",
            )
        return claims

    return _guard
