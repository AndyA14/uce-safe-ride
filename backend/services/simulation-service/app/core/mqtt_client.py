import paho.mqtt.client as mqtt
import json
import logging
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class MQTTPublisher:
    """Publicador MQTT para ubicaciones de viajes"""
    
    def __init__(self):
        self.broker = settings.MQTT_BROKER
        self.port = settings.MQTT_PORT
        self.topic = settings.MQTT_TOPIC
        self.client_id = settings.MQTT_CLIENT_ID
        
        self.client = None
        self.connected = False
    
    def connect(self):
        """Conecta al broker MQTT"""
        try:
            self.client = mqtt.Client(
                client_id=self.client_id,
                protocol=mqtt.MQTTv311
            )
            
            # Callbacks
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            self.client.on_publish = self._on_publish
            
            # Conectar
            logger.info(f"Conectando a MQTT broker: {self.broker}:{self.port}")
            self.client.connect(self.broker, self.port, keepalive=60)
            
            # Start loop en background
            self.client.loop_start()
            
        except Exception as e:
            logger.error(f"Error conectando a MQTT: {e}")
            raise
    
    def disconnect(self):
        """Desconecta del broker MQTT"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            logger.info("Desconectado de MQTT")
    
    def publish_location(self, location_data: Dict[str, Any]):
        """
        Publica una actualización de ubicación.
        
        Args:
            location_data: Diccionario con trip_id, route_id, lat, lng, etc.
        """
        if not self.connected:
            logger.warning("MQTT no conectado, reintentando...")
            self.connect()
        
        try:
            # Formatear mensaje
            message = {
                "event_type": "trip.location.updated",
                "data": location_data
            }
            
            payload = json.dumps(message)
            
            # Publicar
            result = self.client.publish(
                self.topic,
                payload,
                qos=1,
                retain=False
            )
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.debug(
                    f"📍 Ubicación publicada: Trip {location_data.get('trip_id')} "
                    f"@ ({location_data.get('latitude'):.5f}, "
                    f"{location_data.get('longitude'):.5f})"
                )
            else:
                logger.warning(f"Error publicando a MQTT: {result.rc}")
                
        except Exception as e:
            logger.error(f"Error publicando ubicación: {e}")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback cuando se conecta al broker"""
        if rc == 0:
            self.connected = True
            logger.info("✅ Conectado a MQTT broker")
        else:
            logger.error(f"Error conectando a MQTT: {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback cuando se desconecta"""
        self.connected = False
        logger.warning(f"Desconectado de MQTT (rc: {rc})")
    
    def _on_publish(self, client, userdata, mid):
        """Callback cuando se publica mensaje"""
        # logger.debug(f"Mensaje {mid} publicado")
        pass

