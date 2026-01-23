import asyncio
import logging
from typing import Optional, List, Tuple
from datetime import datetime
import math

from app.core.config import settings
from app.core.route_client import RouteClient
from app.core.mqtt_client import MQTTPublisher

logger = logging.getLogger(__name__)

class TripSimulator:
    """Simulador de trayectorias de viajes"""
    
    def __init__(self):
        self.route_client = RouteClient()
        self.mqtt_publisher = MQTTPublisher()
        self.active_simulations = {}  # trip_id -> task
        
        # Conectar MQTT
        try:
            self.mqtt_publisher.connect()
        except Exception as e:
            logger.error(f"Error inicializando MQTT: {e}")
    
    async def start_simulation(
        self,
        trip_id: int,
        route_id: str,
        driver_id: str
    ) -> bool:
        """Inicia la simulación de un viaje."""
        if trip_id in self.active_simulations:
            logger.warning(f"Simulación ya activa para trip {trip_id}")
            return False
        
        try:
            logger.info(f"🚀 Iniciando simulación para trip {trip_id}")
            points = self.route_client.get_route_points(route_id)
            
            if not points:
                logger.error(f"No se obtuvieron puntos para ruta {route_id}")
                return False
            
            task = asyncio.create_task(
                self._simulate_trip(
                    trip_id=trip_id,
                    route_id=route_id,
                    driver_id=driver_id,
                    points=points
                )
            )
            
            self.active_simulations[trip_id] = task
            logger.info(f"✅ Simulación iniciada: Trip {trip_id} con {len(points)} puntos")
            return True
            
        except Exception as e:
            logger.error(f"Error iniciando simulación: {e}")
            return False
    
    async def stop_simulation(self, trip_id: int) -> bool:
        """Detiene la simulación de un viaje."""
        if trip_id not in self.active_simulations:
            logger.warning(f"No hay simulación activa para trip {trip_id}")
            return False
        
        try:
            task = self.active_simulations[trip_id]
            task.cancel()
            
            try:
                await task
            except asyncio.CancelledError:
                pass
            
            del self.active_simulations[trip_id]
            logger.info(f"🛑 Simulación detenida: Trip {trip_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deteniendo simulación: {e}")
            return False
    
    async def _simulate_trip(
        self,
        trip_id: int,
        route_id: str,
        driver_id: str,
        points: List[Tuple[float, float]]
    ):
        logger.info(f"🔄 Iniciando loop de simulación para trip {trip_id}")
        
        try:
            total_points = len(points)
            
            for i, (lat, lng) in enumerate(points):
                # Calcular heading
                heading = 0.0
                if i < len(points) - 1:
                    next_lat, next_lng = points[i + 1]
                    heading = self._calculate_heading(lat, lng, next_lat, next_lng)
                
                # 🚨 ESTRUCTURA ROBUSTA PARA EL FRONTEND
                location_data = {
                    "event_type": "trip.location.updated",
                    "data": {
                        "trip_id": trip_id,
                        "route_id": route_id,
                        "driver_id": driver_id,
                        "latitude": lat,
                        "longitude": lng,
                        "lat": lat,
                        "lng": lng,
                        "heading": heading,
                        "speed": 30.0, # Velocidad simulada
                        "timestamp": datetime.now().isoformat()
                    },
                    # Estructura plana de respaldo
                    "trip_id": trip_id,
                    "latitude": lat,
                    "longitude": lng,
                    "heading": heading,
                    "status": "ACTIVE",
                    "timestamp": datetime.now().isoformat()
                }
                
                # Publicar a MQTT
                self.mqtt_publisher.publish_location(location_data)
                
                # Log de progreso reducido para no saturar consola
                if (i + 1) % 20 == 0:
                    logger.info(f"📍 Trip {trip_id}: {i + 1}/{total_points} puntos | Heading: {heading}")
                
                # Esperar intervalo
                await asyncio.sleep(settings.SIMULATION_INTERVAL / settings.SIMULATION_SPEED_MULTIPLIER)
            
            logger.info(f"✅ Simulación completada: Trip {trip_id}")
            
            if trip_id in self.active_simulations:
                del self.active_simulations[trip_id]
                
        except asyncio.CancelledError:
            logger.info(f"Simulación cancelada: Trip {trip_id}")
            raise
        except Exception as e:
            logger.error(f"Error en simulación de trip {trip_id}: {e}")
            if trip_id in self.active_simulations:
                del self.active_simulations[trip_id]
    
    # ✅ ESTE MÉTODO AHORA ESTÁ AL NIVEL DE LA CLASE (INDENTACIÓN CORRECTA)
    def _calculate_heading(
        self,
        lat1: float,
        lng1: float,
        lat2: float,
        lng2: float
    ) -> float:
        """Calcula el heading (dirección) entre dos puntos."""
        try:
            lat1_rad = math.radians(lat1)
            lat2_rad = math.radians(lat2)
            lng_diff_rad = math.radians(lng2 - lng1)
            
            y = math.sin(lng_diff_rad) * math.cos(lat2_rad)
            x = (
                math.cos(lat1_rad) * math.sin(lat2_rad) -
                math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(lng_diff_rad)
            )
            
            bearing_rad = math.atan2(y, x)
            bearing_deg = math.degrees(bearing_rad)
            
            heading = (bearing_deg + 360) % 360
            return round(heading, 2)
            
        except Exception:
            return 0.0
    
    def get_active_simulations(self) -> List[int]:
        """Retorna lista de trip_ids con simulación activa"""
        return list(self.active_simulations.keys())
    
    def cleanup(self):
        """Limpia recursos"""
        for trip_id in list(self.active_simulations.keys()):
            asyncio.create_task(self.stop_simulation(trip_id))
        
        self.mqtt_publisher.disconnect()