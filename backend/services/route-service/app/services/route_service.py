from app.core.kafka_producer import publish_event
from app.core.events import base_event
from sqlalchemy.orm import Session
from app.db.models import Route



def start_route(route_id: str, driver_id: str, bus_id: str):
    event = base_event(
        event_type="route.started",
        route_id=route_id,
        bus_id=bus_id,
        driver_id=driver_id
    )
    publish_event("route.started", event)
    return {"message": "Route started"}

def bus_arrived_uce(route_id: str, driver_id: str, bus_id: str):
    event = base_event(
        event_type="bus.arrived_uce",
        route_id=route_id,
        bus_id=bus_id,
        driver_id=driver_id
    )
    publish_event("bus.arrived_uce", event)
    return {"message": "Bus arrived at UCE"}

def traffic_detected(route_id: str, driver_id: str, bus_id: str, delay_minutes: int):
    event = base_event(
        event_type="route.traffic_detected",
        route_id=route_id,
        bus_id=bus_id,
        driver_id=driver_id,
        metadata={"delay_minutes": delay_minutes}
    )
    publish_event("route.traffic_detected", event)
    return {"message": "Traffic detected"}

def get_active_route_for_user(user_id: str, role: str, db: Session):
    query = db.query(Route).filter(Route.active.is_(True))
    if role == "DRIVER":
        query = query.filter(Route.driver_id == user_id)
    elif role == "STUDENT":
        pass 
    else:
        return None
    return query.first()

