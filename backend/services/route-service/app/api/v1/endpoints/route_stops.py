import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.db.models import Route, Stop, RouteStop

router = APIRouter()

@router.get("/routes/{route_id}/stops")
def list_route_stops(
    route_id: str,
    principal=Depends(require_role("STUDENT", "DRIVER", "ADMIN")),
    db: Session = Depends(get_db),
):
    rid = uuid.UUID(route_id)
    route = db.get(Route, rid)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    items = (
        db.query(RouteStop)
        .filter(RouteStop.route_id == rid)
        .order_by(RouteStop.order_index.asc())
        .all()
    )

    # devolvemos data "lista para front"
    return [
        {
            "order_index": rs.order_index,
            "stop_id": str(rs.stop.id),
            "name": rs.stop.name,
            "latitude": rs.stop.latitude,
            "longitude": rs.stop.longitude,
            "active": rs.stop.active,
        }
        for rs in items
    ]


@router.post("/routes/{route_id}/stops/{stop_id}", status_code=status.HTTP_201_CREATED)
def add_stop_to_route(
    route_id: str,
    stop_id: str,
    order_index: int = 0,
    principal=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    rid = uuid.UUID(route_id)
    sid = uuid.UUID(stop_id)

    route = db.get(Route, rid)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    stop = db.get(Stop, sid)
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")

    # evita duplicados
    exists = (
        db.query(RouteStop)
        .filter(RouteStop.route_id == rid, RouteStop.stop_id == sid)
        .first()
    )
    if exists:
        raise HTTPException(status_code=409, detail="Stop already linked to route")

    link = RouteStop(route_id=rid, stop_id=sid, order_index=order_index)
    db.add(link)
    db.commit()
    return {"status": "created", "route_id": str(rid), "stop_id": str(sid), "order_index": order_index}


@router.delete("/routes/{route_id}/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_stop_from_route(
    route_id: str,
    stop_id: str,
    principal=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    rid = uuid.UUID(route_id)
    sid = uuid.UUID(stop_id)

    link = (
        db.query(RouteStop)
        .filter(RouteStop.route_id == rid, RouteStop.stop_id == sid)
        .first()
    )
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    db.delete(link)
    db.commit()
    return None
