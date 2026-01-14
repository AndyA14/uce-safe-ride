from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.sessions import get_db
from app.db.models import Route
from app.schemas.routes import RouteCreateIn, RouteUpdateIn, RouteOut
from app.core.security import require_role

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
