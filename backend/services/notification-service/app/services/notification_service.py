from datetime import datetime
from app.db.mongo import notifications_collection

def process_event(event: dict):
    """Procesa el evento y guarda la notificación."""
    event_type = event.get("event_type")
    data = event.get("data", {}) 
    
    trip_id = event.get("trip_id") or data.get("trip_id")
    route_id = event.get("route_id") or data.get("route_id")

    title = "Notificación UCE"
    message = "Tienes un nuevo mensaje."

    if event_type == "trip.started":
        title = "🚍 ¡El bus ha salido!"
        message = f"El viaje ha comenzado. Revisa el mapa."
    elif event_type == "trip.completed":
        title = "🏁 Viaje Finalizado"
        message = "El bus ha llegado a su destino."
    
    notification = {
        "title": title,
        "message": message,
        "event_type": event_type,
        "trip_id": trip_id,
        "route_id": route_id,
        "created_at": datetime.utcnow(),
        "read": False
    }

    try:
        notifications_collection.insert_one(notification)
        print(f"✅ [Mongo] Notificación guardada: {title}", flush=True)
    except Exception as e:
        print(f"⚠️ [Mongo Error] No se pudo guardar: {e}", flush=True)