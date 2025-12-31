from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.core.security import require_role
from app.core.config import settings
from app.db.models import StudentProfile, FavouriteRoute, RouteUsage
from shared.db.session import get_db


router = APIRouter()
bearer = HTTPBearer(auto_error=True)


class CurrentUser(BaseModel):
    user_id: str
    role: str
    email: str | None = None


def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> CurrentUser:
    token = creds.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False},
            issuer=settings.JWT_ISSUER,
        )
        sub = payload.get("sub")
        role = payload.get("role")
        email = payload.get("email")
        if not sub or not role:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return CurrentUser(user_id=str(sub), role=str(role), email=email)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_roles(*allowed: Literal["STUDENT", "ADMIN"]):
    def _guard(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role.upper() not in allowed:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return _guard


# -------------------- Schemas --------------------

class ProfileOut(BaseModel):
    user_id: str
    email: str
    full_name: str | None
    phone: str | None


class ProfileUpdateIn(BaseModel):
    full_name: str | None = None
    phone: str | None = None


class FavouriteIn(BaseModel):
    route_id: str
    alias: str | None = None


class FavouriteOut(BaseModel):
    route_id: str
    alias: str | None


class RouteUsageOut(BaseModel):
    route_id: str
    usage_count: int
    last_used_at: datetime | None


# -------------------- Endpoints --------------------

@router.get("/me")
def get_me(principal=Depends(require_role("STUDENT"))):
    user_id = principal["user_id"]
    return {
        "user_id": user_id,
        "role": principal["role"],
        "email": "unknown@uce.edu.ec",  # en el futuro, el email real vendrá de StudentProfile
        "full_name": "Unknown Student",
        "phone": "",
    }


@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileUpdateIn,
    user: CurrentUser = Depends(require_roles("STUDENT", "ADMIN")),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.user_id).first()
    if not profile:
        profile = StudentProfile(user_id=user.user_id, email=user.email or "unknown@uce.edu.ec")
        db.add(profile)

    profile.full_name = payload.full_name
    profile.phone = payload.phone

    db.commit()
    db.refresh(profile)
    return ProfileOut(
        user_id=profile.user_id,
        email=profile.email,
        full_name=profile.full_name,
        phone=profile.phone,
    )


@router.post("/me/favourites", status_code=201)
def add_favourite_route(
    payload: FavouriteIn,
    user: CurrentUser = Depends(require_roles("STUDENT")),
    db: Session = Depends(get_db),
):
    exists = (
        db.query(FavouriteRoute)
        .filter(
            FavouriteRoute.student_user_id == user.user_id,
            FavouriteRoute.route_id == payload.route_id,
        )
        .first()
    )
    if exists:
        raise HTTPException(status_code=409, detail="Route already in favourites")

    fav = FavouriteRoute(
        student_user_id=user.user_id,
        route_id=payload.route_id,
        alias=payload.alias,
    )
    db.add(fav)
    db.commit()
    return {"status": "created"}


@router.get("/me/favourites", response_model=list[FavouriteOut])
def list_favourites(
    user: CurrentUser = Depends(require_roles("STUDENT")),
    db: Session = Depends(get_db),
):
    favs = (
        db.query(FavouriteRoute)
        .filter(FavouriteRoute.student_user_id == user.user_id)
        .order_by(FavouriteRoute.created_at.desc())
        .all()
    )
    return [FavouriteOut(route_id=f.route_id, alias=f.alias) for f in favs]


@router.delete("/me/favourites/{route_id}")
def remove_favourite(
    route_id: str,
    user: CurrentUser = Depends(require_roles("STUDENT")),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(FavouriteRoute)
        .filter(FavouriteRoute.student_user_id == user.user_id, FavouriteRoute.route_id == route_id)
        .first()
    )
    if not fav:
        raise HTTPException(status_code=404, detail="Favourite not found")

    db.delete(fav)
    db.commit()
    return {"status": "deleted"}


@router.post("/me/routes/{route_id}/use")
def register_route_usage(
    route_id: str,
    user: CurrentUser = Depends(require_roles("STUDENT")),
    db: Session = Depends(get_db),
):
    usage = (
        db.query(RouteUsage)
        .filter(RouteUsage.student_user_id == user.user_id, RouteUsage.route_id == route_id)
        .first()
    )
    if not usage:
        usage = RouteUsage(student_user_id=user.user_id, route_id=route_id, usage_count=0)
        db.add(usage)

    usage.usage_count += 1
    usage.last_used_at = datetime.utcnow()

    db.commit()
    return {"status": "ok", "route_id": route_id, "usage_count": usage.usage_count}


@router.get("/me/most-used", response_model=list[RouteUsageOut])
def most_used_routes(
    user: CurrentUser = Depends(require_roles("STUDENT")),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(RouteUsage)
        .filter(RouteUsage.student_user_id == user.user_id)
        .order_by(RouteUsage.usage_count.desc())
        .limit(10)
        .all()
    )
    return [
        RouteUsageOut(route_id=r.route_id, usage_count=r.usage_count, last_used_at=r.last_used_at)
        for r in rows
    ]
