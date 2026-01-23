import json
import time
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from app.core.config import settings
from app.services.notification_service import process_event 

def start_kafka_consumer():
    """Inicia el consumidor de Kafka."""
    print("🚀 Iniciando Consumidor Kafka (Notification)...", flush=True)

    TOPICS = [settings.KAFKA_TOPIC_TRIPS] 

    while True:
        try:
            consumer = KafkaConsumer(
                *TOPICS,
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                group_id="notification-service-group",
                auto_offset_reset="latest",
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                # ✅ CORRECCIÓN: Aumentamos a 20000 (20s) para que sea > session_timeout (10s)
                request_timeout_ms=20000,
                # Opcional: Explicitar el session_timeout para estar seguros (default es 10000)
                session_timeout_ms=10000
            )

            print(f"🔊 [Notification] Conectado a Kafka. Escuchando: {TOPICS}", flush=True)

            for message in consumer:
                try:
                    event = message.value
                    event_type = event.get("event_type")
                    
                    if event_type in ["trip.started", "trip.completed"]:
                        print(f"📩 [Notification] Procesando: {event_type}", flush=True)
                        process_event(event)
                        
                except Exception as e:
                    print(f"❌ Error procesando evento: {e}", flush=True)

        except Exception as e:
            # Captura general para reintentar si Kafka aún no está listo
            print(f"⚠️ Error conexión Kafka: {e}. Reintentando en 5s...", flush=True)
            time.sleep(5)