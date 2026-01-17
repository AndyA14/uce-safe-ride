from datetime import datetime, timedelta
from jose import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60
ISSUER = "auth-service"

def create_access_token(user_id: str, role: str):
    """
    Genera un JWT firmado con los datos del usuario.
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": user_id,     # Subject (ID del usuario)
        "role": role,       # Rol (STUDENT, DRIVER, ADMIN)
        "iss": ISSUER,      # Issuer (quién emitió)
        "exp": expire,      # Expiration
        "iat": datetime.utcnow() # Issued At
    }
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt