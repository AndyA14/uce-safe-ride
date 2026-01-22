import json
import logging
import asyncio
from aiokafka import AIOKafkaConsumer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.sessions import SessionLocal
from app.services.trip_service import TripService
from app.schemas.trips import TripLocationUpdate

logger = logging.getLogger(__name__)

class TripLocationConsumer:
    """Escucha eventos de Kafka y actualiza la ubicación en PostgreSQL (Trip Service)"""

    def __init__(self):
        self.consumer = None
        self.running = False

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            settings.KAFKA_TOPIC_TRIPS,  # Ej: "trips"
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id="trip-service-location-group",  # Group ID único
            auto_offset_reset="latest"
        )
        try:
            await self.consumer.start()
            self.running = True
            logger.info("📡 Trip Service Location Consumer INICIADO")
            # Lanzamos el loop en background
            asyncio.create_task(self.consume_loop())
        except Exception as e:
            logger.error(f"❌ Error iniciando Consumer en Trip Service: {e}")

    async def stop(self):
        self.running = False
        if self.consumer:
            await self.consumer.stop()
            logger.info("🛑 Trip Service Location Consumer DETENIDO")

    # =========================
    # LOOP DE CONSUMO
    # =========================
    async def consume_loop(self):
        try:
            async for msg in self.consumer:
                if not self.running:
                    break
                try:
                    payload = json.loads(msg.value.decode('utf-8'))
                    event_type = payload.get("event_type")
                    data = payload.get("data", {})

                    # 🕵️‍♂️ DEBUG: imprime TODO lo que llega por Kafka
                    logger.info(f"📩 KAFKA DEBUG: Evento recibido: '{event_type}' | Payload: {json.dumps(data)}")

                    # ✅ FILTRO CORREGIDO: según el log real
                    if event_type == "trip.location.updated": 
                        logger.info(f"📍 Procesando movimiento: Trip {data.get('trip_id')}")
                        await self.process_location_update(data)

                except Exception as e:
                    logger.error(f"⚠️ Error procesando mensaje Kafka: {e}")
        except Exception as e:
            logger.error(f"🔥 Error crítico en Consumer Trip Service: {e}")

    # =========================
    # PROCESAR ACTUALIZACIÓN DE UBICACIÓN
    # =========================
    async def process_location_update(self, data: dict):
        """Actualiza la DB SQL usando TripService"""
        trip_id = data.get("trip_id")
        
        # ✅ Corrección crítica: leer lat/lng directamente del payload
        lat = data.get("latitude")
        lng = data.get("longitude")
        
        if not trip_id or lat is None or lng is None:
            logger.warning(f"⚠️ Datos incompletos para trip {trip_id}: lat={lat}, lng={lng}")
            return

        db: Session = SessionLocal()
        try:
            service = TripService(db)
            
            update_schema = TripLocationUpdate(
                latitude=lat,
                longitude=lng
            )
            
            service.update_location(trip_id, update_schema)
            logger.debug(f"📍 SQL Actualizado: Trip {trip_id} -> {lat}, {lng}")
            
        except Exception as e:
            logger.error(f"❌ Error actualizando SQL trip {trip_id}: {e}")
        finally:
            db.close()

# Instancia global
location_consumer = TripLocationConsumer()
