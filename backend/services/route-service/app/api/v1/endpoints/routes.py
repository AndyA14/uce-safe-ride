import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.db.models import Route
from app.api.v1.schemas.routes import RouteCreateIn, RouteUpdateIn, RouteOut

router = APIRouter()

@router.get("", response_model=list[RouteOut])
def list_routes(principal=Depends(require_role("STUDENT", "DRIVER", "ADMIN")), db: Session = Depends(get_db)):
    return db.query(Route).all()

@router.post("", response_model=RouteOut, status_code=201)
def create_route(
    data: RouteCreateIn,
    db: Session = Depends(get_db),
    user=Depends(require_role("ADMIN"))
):
    route = Route(**data.dict())
    db.add(route)
    db.commit()
    db.refresh(route)
    return route


@router.get("/{route_id}", response_model=RouteOut)
def get_route(route_id: str, principal=Depends(require_role("STUDENT", "DRIVER", "ADMIN")), db: Session = Depends(get_db)):
    rid = uuid.UUID(route_id)
    route = db.get(Route, rid)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.put("/{route_id}", response_model=RouteOut)
def update_route(route_id: str, payload: RouteUpdateIn, principal=Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    rid = uuid.UUID(route_id)
    route = db.get(Route, rid)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    if payload.name is not None:
        route.name = payload.name
    if payload.direction is not None:
        route.direction = payload.direction
    if payload.active is not None:
        route.active = payload.active

    db.commit()
    db.refresh(route)
    return route

@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route(route_id: str, principal=Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    rid = uuid.UUID(route_id)
    route = db.get(Route, rid)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    db.delete(route)
    db.commit()
    return None
