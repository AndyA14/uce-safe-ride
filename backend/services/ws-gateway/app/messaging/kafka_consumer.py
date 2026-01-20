import asyncio
import json
import logging
from aiokafka import AIOKafkaConsumer
from app.core.config import settings
from app.websocket.manager import manager

logger = logging.getLogger(__name__)

async def consume_location_events():
    """
    Escucha eventos de Kafka y los envía al WebSocket Manager.
    Versión con DEBUG RUIDOSO para diagnóstico.
    """
    consumer = AIOKafkaConsumer(
        settings.KAFKA_TOPIC_TRIPS,
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        group_id=settings.KAFKA_GROUP_ID,
        auto_offset_reset="latest",
        value_deserializer=lambda x: x.decode('utf-8')
    )
    
    try:
        await consumer.start()
        # 👇 DEBUG 1: Confirmar conexión
        print(f"🔊 [DEBUG] WS Gateway: CONECTADO a Kafka en '{settings.KAFKA_TOPIC_TRIPS}'", flush=True)
        
        async for msg in consumer:
            try:
                payload = json.loads(msg.value)
                event_type = payload.get("event_type")
                data = payload.get("data", {})

                # 👇 DEBUG 2: Ver TODO lo que llega (incluso si no es de trips)
                # Esto nos dirá si Kafka está enviando algo o si está mudo
                trip_id_debug = data.get("trip_id") or "N/A"
                print(f"📨 [DEBUG] Mensaje recibido: {event_type} | TripID: {trip_id_debug}", flush=True)

                # Filtro: Solo nos interesan eventos de movimiento o inicio
                if event_type in ["trip.location_updated", "trip.started"]:
                    
                    route_id = data.get("route_id") or data.get("trip_id")
                    target_id_str = str(route_id)
                    
                    # 👇 DEBUG 3: Diagnóstico de Suscripción
                    # Verificamos si alguien está escuchando ESTE viaje específico
                    if hasattr(manager, "route_subscriptions"):
                        subs_count = len(manager.route_subscriptions.get(target_id_str, []))
                        print(f"🔍 [DEBUG] Procesando '{event_type}' para ruta '{target_id_str}'. Suscriptores activos: {subs_count}", flush=True)
                    else:
                        print(f"⚠️ [DEBUG] El manager no tiene propiedad 'route_subscriptions'", flush=True)

                    # --- LÓGICA ORIGINAL DE ENVÍO (INTACTA) ---
                    
                    # 1. Intento principal: Broadcast por Ruta
                    if hasattr(manager, "broadcast_to_route") and route_id:
                        await manager.broadcast_to_route(target_id_str, payload)
                        if subs_count > 0:
                            print(f"✅ [DEBUG] Enviado a {subs_count} clientes en ruta {target_id_str}", flush=True)
                    
                    # 2. Fallback: Broadcast General
                    elif hasattr(manager, "broadcast"):
                         print("⚠️ [DEBUG] Usando fallback: Broadcast General", flush=True)
                         await manager.broadcast(payload)
                    
                    # 3. Emergencia: Iteración manual
                    else:
                        print("⚠️ [DEBUG] Usando fallback: Iteración Manual", flush=True)
                        message_text = json.dumps(payload)
                        connections = manager.active_connections
                        if isinstance(connections, dict):
                            targets = list(connections.values())
                        else:
                            targets = connections
                            
                        for ws in targets:
                            try:
                                await ws.send_text(message_text)
                            except:
                                pass 

            except json.JSONDecodeError:
                print("❌ [DEBUG] JSON mal formado", flush=True)
            except Exception as e:
                print(f"❌ [DEBUG] Error procesando mensaje loop: {e}", flush=True)
                
    except asyncio.CancelledError:
        logger.info("🛑 Tarea de Kafka cancelada (Shutdown)")
    except Exception as e:
        print(f"🔥 [FATAL] Error crítico Kafka Consumer: {e}", flush=True)
    finally:
        await consumer.stop()