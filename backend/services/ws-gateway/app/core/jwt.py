from jose import jwt, JWTError
from app.core.config import settings
from typing import Optional

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        print(f"❌ Error validando token en Gateway: {e}")
        return None