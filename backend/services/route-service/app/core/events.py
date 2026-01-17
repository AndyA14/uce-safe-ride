from datetime import datetime

def base_event(event_type: str, route_id: str, bus_id: str, driver_id: str, metadata=None):
    return {
        "event_type": event_type,
        "route_id": route_id,
        "bus_id": bus_id,
        "driver_id": driver_id,
        "timestamp": datetime.utcnow().isoformat(),
        "metadata": metadata or {}
    }
