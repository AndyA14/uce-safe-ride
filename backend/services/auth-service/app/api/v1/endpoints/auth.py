from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.db.session import get_db
from app.db.models import User

router = APIRouter()

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    role: str  # STUDENT, DRIVER, ADMIN

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", response_model=dict, status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    # Domain rule: Students must use UCE domain
    if payload.role.upper() == "STUDENT" and not str(payload.email).endswith(settings.UCE_EMAIL_DOMAIN):
        raise HTTPException(status_code=400, detail=f"Student email must end with {settings.UCE_EMAIL_DOMAIN}")

    existing = db.query(User).filter(User.email == str(payload.email).lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=str(payload.email).lower(),
        password_hash=hash_password(payload.password),
        role=payload.role.upper(),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"user_id": str(user.user_id), "email": user.email, "role": user.role}

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == str(payload.email).lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User inactive")

    token = create_access_token(subject=str(user.user_id), role=user.role)
    return TokenOut(access_token=token)

@router.post("/verify-token", response_model=dict)
def verify_token(token: str):
    try:
        payload = decode_token(token)
        return {"valid": True, "payload": payload}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
