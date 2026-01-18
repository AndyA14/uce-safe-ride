from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.sessions import get_db
from app.db.models import Route
from app.schemas.routes import RouteCreateIn, RouteUpdateIn, RouteOut
from app.core.security import require_role
from app.services.route_service import (
    get_active_route_for_user,
    start_route,
    bus_arrived_uce,
    traffic_detected
)

router = APIRouter()

@router.post("", response_model=RouteOut, status_code=201)
def create_route(
    payload: RouteCreateIn,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("ADMIN")),
):
    route = Route(**payload.dict())
    db.add(route)
    db.commit()
    db.refresh(route)
    return route

@router.get("", response_model=list[RouteOut])
def list_routes(db: Session = Depends(get_db)):
    return db.query(Route).filter(Route.active.is_(True)).all()



@router.get("/active/me", response_model=RouteOut)
def get_my_active_route(
    user: dict = Depends(require_role("STUDENT", "DRIVER")),
    db: Session = Depends(get_db),
):
    user_id = user.get("sub") or user.get("id") or user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: user id missing"
        )

    route = get_active_route_for_user(
        user_id=user_id,
        role=user["role"],
        db=db
    )

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active route for this user"
        )

    return route



@router.get("/{route_id}", response_model=RouteOut)
def get_route(route_id: UUID, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(404, "Route not found")
    return route


@router.put("/{route_id}", response_model=RouteOut)
def update_route(
    route_id: UUID,
    payload: RouteUpdateIn,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("ADMIN")),
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(404, "Route not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(route, field, value)

    db.commit()
    db.refresh(route)
    return route

@router.delete("/{route_id}", status_code=204)
def delete_route(
    route_id: UUID,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("ADMIN")),
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(404, "Route not found")

    route.active = False
    db.commit()



@router.post("/{route_id}/start")
def start_route_endpoint(route_id: str):
    return start_route(route_id, "driver-001", "bus-101")

@router.post("/{route_id}/arrived-uce")
def arrived_uce_endpoint(route_id: str):
    return bus_arrived_uce(route_id, "driver-001", "bus-101")

@router.post("/{route_id}/traffic")
def traffic_endpoint(route_id: str, delay_minutes: int):
    return traffic_detected(route_id, "driver-001", "bus-101", delay_minutes)