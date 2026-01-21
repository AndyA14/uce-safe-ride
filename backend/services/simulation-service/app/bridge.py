import paho.mqtt.client as mqtt
from kafka import KafkaProducer
import json
import logging
import time
from app.core.config import settings

logger = logging.getLogger(__name__)


class MQTTKafkaBridge:
    """Puente que consume de MQTT y publica en Kafka"""
    
    def __init__(self):
        self.mqtt_broker = settings.MQTT_BROKER
        self.mqtt_port = settings.MQTT_PORT
        self.mqtt_topic = settings.MQTT_TOPIC
        
        self.kafka_servers = settings.KAFKA_BOOTSTRAP_SERVERS
        self.kafka_topic = settings.KAFKA_TOPIC_TRIPS
        self.kafka_enabled = settings.KAFKA_ENABLED
        
        self.mqtt_client = None
        self.kafka_producer = None
        self.running = False
    
    def start(self):
        """Inicia el puente MQTT → Kafka"""
        try:
            # Inicializar Kafka Producer
            if self.kafka_enabled:
                self._init_kafka()
            
            # Inicializar MQTT Client
            self._init_mqtt()
            
            # Conectar MQTT
            self.mqtt_client.connect(self.mqtt_broker, self.mqtt_port, 60)
            
            # Iniciar loop
            self.running = True
            logger.info("🌉 Puente MQTT→Kafka iniciado")
            
            self.mqtt_client.loop_forever()
            
        except Exception as e:
            logger.error(f"Error en bridge: {e}")
            raise
    
    def stop(self):
        """Detiene el puente"""
        self.running = False
        
        if self.mqtt_client:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
        
        if self.kafka_producer:
            self.kafka_producer.flush()
            self.kafka_producer.close()
        
        logger.info("🛑 Puente MQTT→Kafka detenido")
    
    def _init_kafka(self):
        """Inicializa el productor de Kafka"""
        try:
            self.kafka_producer = KafkaProducer(
                bootstrap_servers=self.kafka_servers.split(','),
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                key_serializer=lambda k: k.encode('utf-8') if k else None,
                acks='all',
                retries=3,
                max_in_flight_requests_per_connection=1
            )
            logger.info(f"✅ Kafka producer conectado: {self.kafka_servers}")
        except Exception as e:
            logger.error(f"Error conectando a Kafka: {e}")
            self.kafka_enabled = False
    
    def _init_mqtt(self):
        """Inicializa el cliente MQTT"""
        self.mqtt_client = mqtt.Client(
            client_id="mqtt-kafka-bridge",
            protocol=mqtt.MQTTv311
        )
        
        self.mqtt_client.on_connect = self._on_connect
        self.mqtt_client.on_message = self._on_message
        self.mqtt_client.on_disconnect = self._on_disconnect
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback cuando se conecta a MQTT"""
        if rc == 0:
            logger.info(f"✅ Bridge conectado a MQTT")
            # Suscribirse al tópico
            client.subscribe(self.mqtt_topic, qos=1)
            logger.info(f"📡 Suscrito a tópico: {self.mqtt_topic}")
        else:
            logger.error(f"Error conectando a MQTT: {rc}")
    
    def _on_message(self, client, userdata, msg):
        """
        Callback cuando llega un mensaje MQTT.
        Reenvía el mensaje a Kafka.
        """
        try:
            # Decodificar mensaje
            payload = msg.payload.decode('utf-8')
            message_data = json.loads(payload)
            
            # Log
            trip_id = message_data.get('data', {}).get('trip_id', 'unknown')
            logger.debug(f"🔄 MQTT→Kafka: Trip {trip_id}")
            
            # Publicar a Kafka
            if self.kafka_enabled and self.kafka_producer:
                self._publish_to_kafka(message_data)
            
        except Exception as e:
            logger.error(f"Error procesando mensaje MQTT: {e}")
    
    def _publish_to_kafka(self, message_data: dict):
        """Publica mensaje a Kafka"""
        try:
            # Usar trip_id como key para particionamiento
            trip_id = str(message_data.get('data', {}).get('trip_id', ''))
            
            # Publicar
            future = self.kafka_producer.send(
                self.kafka_topic,
                value=message_data,
                key=trip_id
            )
            
            # Esperar confirmación (opcional)
            record_metadata = future.get(timeout=5)
            
            logger.debug(
                f"📤 Kafka: {record_metadata.topic} "
                f"[{record_metadata.partition}:{record_metadata.offset}]"
            )
            
        except Exception as e:
            logger.error(f"Error publicando a Kafka: {e}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback cuando se desconecta de MQTT"""
        logger.warning(f"Desconectado de MQTT (rc: {rc})")
        
        # Intentar reconectar
        if self.running and rc != 0:
            logger.info("Intentando reconectar a MQTT...")
            time.sleep(5)