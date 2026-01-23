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
            
            consumer = AIOKafkaConsumer(
                settings.KAFKA_TOPIC_TRIPS,
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                group_id="ws-gateway-group-broadcast",
                auto_offset_reset="latest",
                value_deserializer=lambda x: x.decode('utf-8')
            )
            
            await consumer.start()
            print(f"🔊 [WS Gateway] ✅ ¡CONECTADO! Escuchando: '{settings.KAFKA_TOPIC_TRIPS}'", flush=True)
            
            async for msg in consumer:
                try:
                    payload = json.loads(msg.value)
                    
                    # Log de depuración para confirmar recepción
                    # print(f"📨 [WS Gateway] Recibido: {payload.get('trip_id')}", flush=True)

                    event_type = payload.get("event_type")
                    ACCEPTED_EVENTS = ["trip.location.updated", "trip.location_updated"]

                    if event_type in ACCEPTED_EVENTS:
                        # 🚀 CAMBIO CLAVE: ENVIAR A TODOS (BROADCAST GLOBAL)
                        # Ignoramos route_id/target_id para asegurar que le llegue al frontend
                        await manager.broadcast(payload)
                                
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