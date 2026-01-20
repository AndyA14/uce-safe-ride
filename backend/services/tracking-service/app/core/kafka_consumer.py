import json
import logging
import asyncio
from aiokafka import AIOKafkaConsumer
from app.core.config import settings
# ❌ BORRADO: from app.db.mongo import db (Lo movemos abajo)

logger = logging.getLogger(__name__)

class TrackingConsumer:
    def __init__(self):
        self.consumer = None
        self.running = False

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            settings.KAFKA_TOPIC_TRIPS,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id=settings.KAFKA_GROUP_ID,
            auto_offset_reset="latest",
            value_deserializer=lambda x: x.decode('utf-8')
        )
        try:
            await self.consumer.start()
            self.running = True
            logger.info("📡 Tracking Consumer iniciado y escuchando Kafka...")
            asyncio.create_task(self.consume_loop())
        except Exception as e:
            logger.error(f"❌ Error iniciando Kafka Consumer: {e}")

    async def stop(self):
        self.running = False
        if self.consumer:
            await self.consumer.stop()
            logger.info("🛑 Tracking Consumer detenido.")

    async def consume_loop(self):
        try:
            async for msg in self.consumer:
                if not self.running: break
                
                try:
                    payload = json.loads(msg.value)
                    event_type = payload.get("event_type")
                    data = payload.get("data", {})

                    # Procesamos solo eventos de ubicación o inicio
                    if event_type in ["trip.location_updated", "trip.started"]:
                        await self.save_location(data)
                        
                except Exception as e:
                    logger.error(f"⚠️ Error procesando mensaje: {e}")
        except Exception as e:
            logger.error(f"🔥 Error crítico en loop Kafka: {e}")

    async def save_location(self, data: dict):
        """Guarda la ubicación en MongoDB"""
        
        # ✅ IMPORTACIÓN TARDÍA: Obliga a leer la variable global ACTUALIZADA
        from app.db.mongo import db 
        
        # 🕵️‍♂️ DEBUG: Imprimimos el estado real
        if db.database is None:
            print(f"❌ [DEBUG] db.database es None. ID del objeto db: {id(db)}", flush=True)
            logger.warning("Base de datos no lista, saltando guardado.")
            return
        
        # Si pasa, imprimimos éxito
        print(f"✅ [DEBUG] db.database LISTO. ID del objeto db: {id(db)}", flush=True)

        try:
            # Normalizar datos (trip.started vs location_updated)
            lat, lon = 0.0, 0.0
            if "location" in data:
                lat = data["location"].get("latitude")
                lon = data["location"].get("longitude")
            elif "initial_location" in data:
                lat = data["initial_location"].get("latitude")
                lon = data["initial_location"].get("longitude")

            document = {
                "trip_id": data.get("trip_id"),
                "driver_id": data.get("driver_id"),
                "location": {
                    "type": "Point",
                    "coordinates": [lon, lat] # [Longitud, Latitud] para GeoJSON
                },
                "speed": data.get("speed", 0.0),
                "heading": data.get("heading", 0.0),
                "timestamp": data.get("timestamp") or data.get("actual_start_time")
            }

            # Insertar en colección 'locations'
            await db.database.locations.insert_one(document)
            logger.info(f"📍 Guardado en Mongo: Trip {data.get('trip_id')}")

        except Exception as e:
            logger.error(f"❌ Error insertando en Mongo: {e}")

tracking_consumer = TrackingConsumer()