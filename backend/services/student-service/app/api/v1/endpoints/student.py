from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.schemas.students import (
    ProfileOut,
    ProfileUpdateIn,
    FavouriteIn,
    FavouriteOut,
    RouteUsageOut,
)
from app.core.security import require_role, bearer_scheme
from app.db.models import StudentProfile, FavouriteRoute, RouteUsage
from shared.db.session import get_db

# Cliente para Vehicle Service
from app.services.vehicle_client import get_vehicle_client, VehicleClient

router = APIRouter()

# ------------------------------------------------------------------
# PERFIL DEL ESTUDIANTE
# ------------------------------------------------------------------

@router.get("/me")
def get_me(
    principal: Dict[str, Any] = Depends(require_role("STUDENT")),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == principal["user_id"])
        .first()
    )

    if profile:
        return {
            "user_id": profile.user_id,
            "role": principal["role"],
            "email": profile.email,
            "full_name": profile.full_name,
            "phone": profile.phone or "",
        }

    return {
        "user_id": principal["user_id"],
        "role": principal["role"],
        "email": principal.get("sub", "usuario@uce.edu.ec"),
        "full_name": "Estudiante Nuevo",
        "phone": "",
    }


@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileUpdateIn,
    user: Dict[str, Any] = Depends(require_role("STUDENT", "ADMIN")),
    db: Session = Depends(get_db),
):
    """
    Crea o actualiza el perfil del estudiante.
    """
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == user["user_id"])
        .first()
    )

    # Si no existe, lo creamos
    if not profile:
        profile = StudentProfile(
            user_id=user["user_id"],
            email=user.get("sub", "usuario@uce.edu.ec"),
        )
        db.add(profile)

    # Actualización parcial
    if payload.full_name is not None:
        profile.full_name = payload.full_name

    if payload.phone is not None:
        profile.phone = payload.phone

    db.commit()
    db.refresh(profile)

    return ProfileOut(
        user_id=profile.user_id,
        email=profile.email,
        full_name=profile.full_name,
        phone=profile.phone,
    )

# ------------------------------------------------------------------
# VEHÍCULOS ASIGNADOS (Vehicle Service)
# ------------------------------------------------------------------

@router.get("/me/vehicles")
async def get_my_vehicles(
    user: Dict[str, Any] = Depends(require_role("STUDENT")),
    client: VehicleClient = Depends(get_vehicle_client),
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Obtiene los vehículos asociados al estudiante desde Vehicle Service.
    """
    return await client.get_vehicles_by_student(
        student_id=user["user_id"],
        token=creds.credentials,
    )

# ------------------------------------------------------------------
# RUTAS FAVORITAS
# ------------------------------------------------------------------

@router.post("/me/favourites", status_code=201)
def add_favourite_route(
    payload: FavouriteIn,
    user: Dict[str, Any] = Depends(require_role("STUDENT")),
    db: Session = Depends(get_db),
):
    exists = (
        db.query(FavouriteRoute)
        .filter(
            FavouriteRoute.student_user_id == user["user_id"],
            FavouriteRoute.route_id == payload.route_id,
        )
        .first()
    )
    if exists:
        raise HTTPException(status_code=409, detail="Route already in favourites")

    fav = FavouriteRoute(
        student_user_id=user["user_id"],
        route_id=payload.route_id,
        alias=payload.alias,
    )
    db.add(fav)
    db.commit()

    return {"status": "created"}


@router.get("/me/favourites", response_model=list[FavouriteOut])
def list_favourites(
    user: Dict[str, Any] = Depends(require_role("STUDENT")),
    db: Session = Depends(get_db),
):
    favs = (
        db.query(FavouriteRoute)
        .filter(FavouriteRoute.student_user_id == user["user_id"])
        .order_by(FavouriteRoute.created_at.desc())
        .all()
    )

    return [
        FavouriteOut(route_id=f.route_id, alias=f.alias)
        for f in favs
    ]


@router.delete("/me/favourites/{route_id}")
def remove_favourite(
    route_id: str,
    user: Dict[str, Any] = Depends(require_role("STUDENT")),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(FavouriteRoute)
        .filter(
            FavouriteRoute.student_user_id == user["user_id"],
            FavouriteRoute.route_id == route_id,
        )
        .first()
    )

    if not fav:
        raise HTTPException(status_code=404, detail="Favourite not found")

    db.delete(fav)
    db.commit()

    return {"status": "deleted"}

# ------------------------------------------------------------------
# USO DE RUTAS
# ------------------------------------------------------------------

@router.post("/me/routes/{route_id}/use")
def register_route_usage(
    route_id: str,
    user: Dict[str, Any] = Depends(require_role("STUDENT")),
    db: Session = Depends(get_db),
):
    usage = (
        db.query(RouteUsage)
        .filter(
            RouteUsage.student_user_id == user["user_id"],
            RouteUsage.route_id == route_id,
        )
        .first()
    )

    if not usage:
        usage = RouteUsage(
            student_user_id=user["user_id"],
            route_id=route_id,
            usage_count=0,
        )
        db.add(usage)

    usage.usage_count += 1
    usage.last_used_at = datetime.utcnow()

    db.commit()

    return {
        "status": "ok",
        "route_id": route_id,
        "usage_count": usage.usage_count,
    }


@router.get("/me/most-used", response_model=list[RouteUsageOut])
def most_used_routes(
    user: Dict[str, Any] = Depends(require_role("STUDENT")),
    db: Session = Depends(get_db),
):
    """
    Placeholder: implementar ranking real más adelante.
    """
    return []
