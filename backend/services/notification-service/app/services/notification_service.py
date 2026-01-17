from datetime import datetime
from db.mongo import notifications_collection

def build_message(event: dict) -> str:
    etype = event.get("event_type")

    if etype == "route.started":
        return "🚌 La ruta ha iniciado"

    if etype == "bus.arrived_uce":
        return "🎓 El bus ha llegado a la UCE"

    if etype == "route.traffic_detected":
        delay = event.get("metadata", {}).get("delay_minutes", 0)
        return f"🚦 Tráfico detectado. Retraso estimado: {delay} minutos"

    if etype == "payment.completed":
        return "💳 Pago confirmado exitosamente"

    return "🔔 Nueva notificación"


def process_event(event: dict):
    message = build_message(event)

    notification = {
        "event_type": event.get("event_type"),
        "route_id": event.get("route_id"),
        "message": message,
        "payload": event,
        "created_at": datetime.utcnow(),
    }

    notifications_collection.insert_one(notification)
    print("✅ Notification stored in MongoDB")
