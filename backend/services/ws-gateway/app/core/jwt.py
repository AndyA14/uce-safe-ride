from jose import jwt
from app.core.config import settings

def decode_token(token: str):
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM]
    )
