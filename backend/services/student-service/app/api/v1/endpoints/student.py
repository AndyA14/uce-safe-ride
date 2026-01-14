import uuid
from datetime import datetime
from typing import Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.init_db import get_db
from app.db.models import (
    StudentProfile,
    FavouriteRoute,
    RouteUsage,
    StudentCustomRoute,
)
from app.schemas.students import (
    ProfileOut,
    ProfileUpdateIn,
    FavouriteIn,
    FavouriteOut,
    RouteUsageOut,
    StudentCustomRouteCreateIn,
    StudentCustomRouteUpdateIn,
    StudentCustomRouteOut,
)
from app.api.deps import get_current_user, require_role
from app.services.vehicle_client import get_vehicle_client, VehicleClient

router = APIRouter()
security = HTTPBearer()


# ------------------------------------------------------------------
# HELPERS
# ------------------------------------------------------------------
def map_custom_route(route: StudentCustomRoute) -> StudentCustomRouteOut:
    return StudentCustomRouteOut(
        id=route.id,
        name=route.name,
        origin={"lat": route.origin_lat, "lng": route.origin_lng},
        destination={
            "lat": route.destination_lat,
            "lng": route.destination_lng,
        },
        polyline=route.polyline,
        active=route.active,
    )


# ------------------------------------------------------------------
# PROFILE
# ------------------------------------------------------------------
@router.get("/me", response_model=ProfileOut)
def get_me(
    current_user=Depends(require_role("STUDENT")),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.auth_user_id == current_user["user_id"])
        .first()
    )

    if not profile:
        profile = StudentProfile(
            auth_user_id=current_user["user_id"],
            email=current_user.get("sub"),
            full_name="Estudiante nuevo",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.put("/me", response_model=ProfileOut)
def update_me(
    payload: ProfileUpdateIn,
    current_user=Depends(require_role("STUDENT")),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.auth_user_id == current_user["user_id"])
        .first()
    )

    if not profile:
        profile = StudentProfile(
            auth_user_id=current_user["user_id"],
            email=current_user.get("sub"),
        )
        db.add(profile)

    if payload.full_name is not None:
        profile.full_name = payload.full_name

    if payload.phone is not None:
        profile.phone = payload.phone

    db.commit()
    db.refresh(profile)

    return profile


# ------------------------------------------------------------------
# VEHICLES
# ------------------------------------------------------------------
@router.get("/me/vehicles")
async def get_my_vehicles(
    user: Dict[str, Any] = Depends(get_current_user),
    client: VehicleClient = Depends(get_vehicle_client),
    creds: HTTPAuthorizationCredentials = Depends(security),
):
    return await client.get_vehicles_by_student(
        student_id=str(user["user_id"]),
        token=creds.credentials,
    )


# ------------------------------------------------------------------
# FAVOURITES
# ------------------------------------------------------------------
@router.post("/me/favourites", status_code=status.HTTP_201_CREATED)
def add_favourite_route(
    payload: FavouriteIn,
    user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exists = (
        db.query(FavouriteRoute)
        .filter(
            FavouriteRoute.student_user_id == str(user["user_id"]),
            FavouriteRoute.route_id == payload.route_id,
        )
        .first()
    )

    if exists:
        raise HTTPException(status_code=409, detail="Route already in favourites")

    fav = FavouriteRoute(
        student_user_id=str(user["user_id"]),
        route_id=payload.route_id,
        alias=payload.alias,
    )

    db.add(fav)
    db.commit()

    return {"status": "created"}


@router.get("/me/favourites", response_model=List[FavouriteOut])
def list_favourites(
    user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favs = (
        db.query(FavouriteRoute)
        .filter(FavouriteRoute.student_user_id == str(user["user_id"]))
        .order_by(FavouriteRoute.created_at.desc())
        .all()
    )

    return [FavouriteOut(route_id=f.route_id, alias=f.alias) for f in favs]


@router.delete("/me/favourites/{route_id}")
def remove_favourite(
    route_id: uuid.UUID,
    user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(FavouriteRoute)
        .filter(
            FavouriteRoute.student_user_id == str(user["user_id"]),
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
# ROUTE USAGE
# ------------------------------------------------------------------
@router.post("/me/routes/{route_id}/use")
def register_route_usage(
    route_id: uuid.UUID,
    user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    usage = (
        db.query(RouteUsage)
        .filter(
            RouteUsage.student_user_id == str(user["user_id"]),
            RouteUsage.route_id == route_id,
        )
        .first()
    )

    if not usage:
        usage = RouteUsage(
            student_user_id=str(user["user_id"]),
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


# ------------------------------------------------------------------
# CUSTOM ROUTES
# ------------------------------------------------------------------
@router.get("/me/custom-routes", response_model=List[StudentCustomRouteOut])
def list_custom_routes(
    user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    routes = (
        db.query(StudentCustomRoute)
        .filter(
            StudentCustomRoute.student_user_id == str(user["user_id"]),
            StudentCustomRoute.active.is_(True),
        )
        .order_by(StudentCustomRoute.created_at.desc())
        .all()
    )

    return [map_custom_route(r) for r in routes]


@router.post(
    "/me/custom-routes",
    response_model=StudentCustomRouteOut,
    status_code=201,
)
def create_custom_route(
    payload: StudentCustomRouteCreateIn,
    user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = StudentCustomRoute(
        student_user_id=str(user["user_id"]),
        name=payload.name,
        origin_lat=payload.origin.lat,
        origin_lng=payload.origin.lng,
        destination_lat=payload.destination.lat,
        destination_lng=payload.destination.lng,
        polyline=payload.polyline,
    )

    db.add(route)
    db.commit()
    db.refresh(route)

    return map_custom_route(route)


@router.put(
    "/me/custom-routes/{route_id}",
    response_model=StudentCustomRouteOut,
)
def update_custom_route(
    route_id: uuid.UUID,
    payload: StudentCustomRouteUpdateIn,
    user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = (
        db.query(StudentCustomRoute)
        .filter(
            StudentCustomRoute.id == route_id,
            StudentCustomRoute.student_user_id == str(user["user_id"]),
        )
        .first()
    )

    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    if payload.name is not None:
        route.name = payload.name

    if payload.origin is not None:
        route.origin_lat = payload.origin.lat
        route.origin_lng = payload.origin.lng

    if payload.destination is not None:
        route.destination_lat = payload.destination.lat
        route.destination_lng = payload.destination.lng

    if payload.active is not None:
        route.active = payload.active

    db.commit()
    db.refresh(route)

    return map_custom_route(route)


@router.delete("/me/custom-routes/{route_id}", status_code=204)
def delete_custom_route(
    route_id: uuid.UUID,
    user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = (
        db.query(StudentCustomRoute)
        .filter(
            StudentCustomRoute.id == route_id,
            StudentCustomRoute.student_user_id == str(user["user_id"]),
        )
        .first()
    )

    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    route.active = False
    db.commit()
