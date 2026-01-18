# app/core/kafka_producer.py
from kafka import KafkaProducer
from kafka.errors import KafkaError
import json
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class KafkaProducerManager:
    """Gestor del productor de Kafka"""
    
    def __init__(self):
        self.producer: Optional[KafkaProducer] = None
        self.enabled = settings.KAFKA_ENABLED
        
        if self.enabled:
            try:
                self.producer = KafkaProducer(
                    bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS.split(','),
                    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                    key_serializer=lambda k: k.encode('utf-8') if k else None,
                    acks='all',
                    retries=3,
                    max_in_flight_requests_per_connection=1
                )
                logger.info(f"Kafka producer conectado: {settings.KAFKA_BOOTSTRAP_SERVERS}")
            except KafkaError as e:
                logger.error(f"Error conectando a Kafka: {e}")
                self.enabled = False
    
    def send(self, topic: str, value: dict, key: Optional[str] = None) -> bool:
        """
        Envía un mensaje a Kafka.
        Retorna True si se envió exitosamente, False en caso contrario.
        """
        if not self.enabled or not self.producer:
            logger.warning("Kafka deshabilitado, mensaje no enviado")
            return False
        
        try:
            future = self.producer.send(topic, value=value, key=key)
            record_metadata = future.get(timeout=10)
            logger.info(
                f"Mensaje enviado a {record_metadata.topic} "
                f"partition {record_metadata.partition} "
                f"offset {record_metadata.offset}"
            )
            return True
        except KafkaError as e:
            logger.error(f"Error enviando mensaje a Kafka: {e}")
            return False
    
    def flush(self):
        """Fuerza el envío de mensajes pendientes"""
        if self.producer:
            self.producer.flush()
    
    def close(self):
        """Cierra la conexión con Kafka"""
        if self.producer:
            self.producer.close()
            logger.info("Kafka producer cerrado")


# Instancia global
kafka_producer = KafkaProducerManager()


