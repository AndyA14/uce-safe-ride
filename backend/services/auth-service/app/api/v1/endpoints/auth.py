from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from shared.core.config import settings
from shared.db.session import get_db
from shared.security.hashing import hash_password, verify_password
from shared.security.jwt import create_access_token, decode_token
from shared.schemas.auth import TokenOut

from app.models.user import User

router = APIRouter()
security = HTTPBearer()

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    role: str = "STUDENT"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", status_code=201)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if not data.email.endswith(settings.UCE_EMAIL_DOMAIN):
        raise HTTPException(status_code=400, detail="Invalid UCE email")

    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=409, detail="User already exists")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"id": str(user.id), "email": user.email}

@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(subject=str(user.id), role=user.role)
    return TokenOut(access_token=token)

@router.post("/verify-token")
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        return {"valid": True, "payload": payload}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )