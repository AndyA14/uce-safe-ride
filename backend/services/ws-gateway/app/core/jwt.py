from jose import jwt, JWTError
from core.config import JWT_SECRET_KEY, JWT_ALGORITHM

def decode_token(token: str):
    """
    Decodifica el token JWT y devuelve el payload (datos del usuario).
    Si el token es inválido o expiró, devuelve None.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None