import asyncio
import json
import logging
from aiokafka import AIOKafkaConsumer
from app.core.config import settings
from app.websocket.manager import manager

logger = logging.getLogger(__name__)

async def consume_location_events():
    """
    Consumidor con Reintento Infinito y Broadcast Global.
    """
    retry_delay = 5

    while True:
        consumer = None
        try:
            print(f"🔄 [WS Gateway] Conectando a Kafka ({settings.KAFKA_BOOTSTRAP_SERVERS})...", flush=True)

            # ✅ Se agrega el canal de alertas a la suscripción
            consumer = AIOKafkaConsumer(
                settings.KAFKA_TOPIC_TRIPS,
                settings.KAFKA_TOPIC_ALERTS,  # 👈 ¡AGREGA ESTO! Suscripción adicional a alertas
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                group_id="ws-gateway-group-broadcast",
                auto_offset_reset="latest",
                value_deserializer=lambda x: x.decode('utf-8')
            )

            await consumer.start()
            print(f"🔊 [WS Gateway] ✅ ¡CONECTADO! Escuchando: '{settings.KAFKA_TOPIC_TRIPS}', '{settings.KAFKA_TOPIC_ALERTS}'", flush=True)

            async for msg in consumer:
                try:
                    payload = json.loads(msg.value)

                    # Log de depuración para confirmar recepción
                    # print(f"📨 [WS Gateway] Recibido: {payload.get('trip_id')}", flush=True)

                    event_type = payload.get("event_type")

                    # Definir eventos aceptados para las ubicaciones
                    ACCEPTED_EVENTS = ["trip.location.updated", "trip.location_updated"]

                    if event_type in ACCEPTED_EVENTS:
                        # 🚀 CAMBIO CLAVE: Enviar la ubicación a todos (broadcast global)
                        # Ignoramos route_id/target_id para asegurar que le llegue al frontend
                        await manager.broadcast(payload)

                    # Nueva lógica para las alertas
                    if event_type == "traffic_alert":
                        # ✅ Procesar y emitir alertas
                        print(f"🚨 [WS Gateway] Alerta recibida: {payload.get('message')}")
                        await manager.broadcast(payload)  # Emitir alerta a todos los clientes

                except json.JSONDecodeError:
                    pass
                except Exception as e:
                    print(f"❌ [WS Gateway] Error procesando mensaje: {e}", flush=True)

        except Exception as e:
            print(f"⚠️ [WS Gateway] Fallo Kafka: {e}. Reintentando en {retry_delay}s...", flush=True)
            await asyncio.sleep(retry_delay)

        finally:
            if consumer:
                try:
                    await consumer.stop()
                except:
                    pass
