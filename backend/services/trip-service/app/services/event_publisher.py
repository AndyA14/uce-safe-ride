"""
Servicio para publicar eventos del dominio de viajes a Kafka.
Centraliza toda la lógica de publicación de eventos.
"""
from datetime import datetime
from typing import Optional
import logging

from app.db.models import Trip, TripPassenger
from app.core.kafka_producer import kafka_producer
from app.core.config import settings
from app.core.events import (
    EventType, create_trip_event, create_passenger_event
)
from app.schemas.events import (
    TripCreatedEvent, TripStartedEvent, TripCompletedEvent,
    TripCancelledEvent, TripLocationUpdatedEvent,
    PassengerJoinedEvent, PassengerBoardedEvent, PassengerRemovedEvent,
    LocationData
)

logger = logging.getLogger(__name__)


class EventPublisher:
    """
    Servicio para publicar eventos del dominio de viajes.
    Encapsula la lógica de Kafka y serialización de eventos.
    """
    
    def __init__(self):
        self.topic = settings.KAFKA_TOPIC_TRIPS
        self.enabled = settings.KAFKA_ENABLED
    
    def _publish(self, event_type: str, data: dict, key: Optional[str] = None) -> bool:
        """
        Método interno para publicar eventos a Kafka.
        
        Args:
            event_type: Tipo de evento (ej: "trip.started")
            data: Payload del evento
            key: Key de Kafka para particionamiento (default: trip_id)
        
        Returns:
            True si se publicó exitosamente, False en caso contrario
        """
        if not self.enabled:
            logger.warning(f"Kafka deshabilitado. Evento {event_type} no publicado.")
            return False
        
        # Construir envelope del evento
        event_envelope = {
            "event_type": event_type,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        
        # Usar trip_id como key por defecto para particionar por viaje
        if key is None and "trip_id" in data:
            key = str(data["trip_id"])
        
        # Publicar a Kafka
        success = kafka_producer.send(
            topic=self.topic,
            value=event_envelope,
            key=key
        )
        
        if success:
            logger.info(f"Evento {event_type} publicado exitosamente para trip {key}")
        else:
            logger.error(f"Error publicando evento {event_type} para trip {key}")
        
        return success
    
    # ==================== Trip Events ====================
    
    def publish_trip_created(self, trip: Trip) -> bool:
        """
        Publica evento: trip.created
        
        Consumidores:
        - Notification Service (notificar creación)
        """
        event_data = TripCreatedEvent(
            trip_id=trip.id,
            route_id=trip.route_id,
            driver_id=trip.driver_id,
            vehicle_id=trip.vehicle_id,
            scheduled_start_time=trip.scheduled_start_time.isoformat(),
            max_passengers=trip.max_passengers,
            status=trip.status.value
        )
        
        return self._publish(
            EventType.TRIP_CREATED.value,
            event_data.model_dump()
        )
    
    def publish_trip_started(self, trip: Trip) -> bool:
        """
        Publica evento: trip.started
        
        **CRÍTICO**: Este evento inicia el tracking en tiempo real.
        
        Consumidores:
        - WebSocket Gateway (habilitar conexiones para esta ruta)
        - Tracking Service (iniciar registro de ubicaciones)
        - Notification Service (notificar a estudiantes)
        """
        event_data = TripStartedEvent(
            trip_id=trip.id,
            route_id=trip.route_id,
            driver_id=trip.driver_id,
            vehicle_id=trip.vehicle_id,
            actual_start_time=trip.actual_start_time.isoformat() if trip.actual_start_time else datetime.now().isoformat(),
            initial_location=LocationData(
                latitude=trip.current_latitude,
                longitude=trip.current_longitude
            ),
            status=trip.status.value
        )
        
        return self._publish(
            EventType.TRIP_STARTED.value,
            event_data.model_dump()
        )
    
    def publish_trip_completed(self, trip: Trip) -> bool:
        """
        Publica evento: trip.completed
        
        **CRÍTICO**: Este evento dispara el procesamiento de pagos.
        
        Consumidores:
        - Payment Service (procesar pagos de pasajeros)
        - WebSocket Gateway (cerrar conexiones de la ruta)
        - Tracking Service (detener registro de ubicaciones)
        - Notification Service (notificar finalización)
        """
        event_data = TripCompletedEvent(
            trip_id=trip.id,
            route_id=trip.route_id,
            driver_id=trip.driver_id,
            vehicle_id=trip.vehicle_id,
            actual_start_time=trip.actual_start_time.isoformat() if trip.actual_start_time else None,
            actual_end_time=trip.actual_end_time.isoformat() if trip.actual_end_time else datetime.now().isoformat(),
            passenger_count=trip.current_passenger_count,
            final_location=LocationData(
                latitude=trip.current_latitude or 0.0,
                longitude=trip.current_longitude or 0.0
            ),
            status=trip.status.value
        )
        
        return self._publish(
            EventType.TRIP_COMPLETED.value,
            event_data.model_dump()
        )
    
    def publish_trip_cancelled(self, trip: Trip, reason: str) -> bool:
        """
        Publica evento: trip.cancelled
        
        Consumidores:
        - Tracking Service (detener tracking)
        - Notification Service (notificar cancelación a pasajeros)
        - Payment Service (manejar reembolsos si aplica)
        """
        event_data = TripCancelledEvent(
            trip_id=trip.id,
            route_id=trip.route_id,
            driver_id=trip.driver_id,
            reason=reason,
            status=trip.status.value
        )
        
        return self._publish(
            EventType.TRIP_CANCELLED.value,
            event_data.model_dump()
        )
    
    def publish_trip_location_updated(self, trip: Trip) -> bool:
        """
        Publica evento: trip.location_updated
        
        **OPCIONAL**: Para tracking via Kafka en lugar de MQTT/Redis.
        Puede generar alto volumen de mensajes.
        
        Consumidores:
        - WebSocket Gateway (opcional, para broadcast de ubicación)
        - Analytics Service (opcional, para análisis de rutas)
        """
        event_data = TripLocationUpdatedEvent(
            trip_id=trip.id,
            route_id=trip.route_id,
            driver_id=trip.driver_id,
            location=LocationData(
                latitude=trip.current_latitude,
                longitude=trip.current_longitude
            ),
            timestamp=trip.last_location_update.isoformat() if trip.last_location_update else datetime.now().isoformat()
        )
        
        return self._publish(
            EventType.TRIP_LOCATION_UPDATED.value,
            event_data.model_dump()
        )
    
    # ==================== Passenger Events ====================
    
    def publish_passenger_joined(self, passenger: TripPassenger, trip: Trip) -> bool:
        """
        Publica evento: passenger.joined
        
        Consumidores:
        - Notification Service (notificar al conductor)
        - Analytics Service (métricas de ocupación)
        """
        event_data = PassengerJoinedEvent(
            trip_id=passenger.trip_id,
            route_id=trip.route_id,
            passenger_id=passenger.id,
            student_id=passenger.student_id,
            stop_id=passenger.stop_id,
            fare_amount=passenger.fare_amount,
            status=passenger.status.value,
            current_passenger_count=trip.current_passenger_count
        )
        
        return self._publish(
            EventType.PASSENGER_JOINED.value,
            event_data.model_dump()
        )
    
    def publish_passenger_boarded(self, passenger: TripPassenger, trip: Trip) -> bool:
        """
        Publica evento: passenger.boarded
        
        Consumidores:
        - Notification Service (notificar al estudiante)
        - Analytics Service (métricas de abordaje)
        """
        event_data = PassengerBoardedEvent(
            trip_id=passenger.trip_id,
            route_id=trip.route_id,
            passenger_id=passenger.id,
            student_id=passenger.student_id,
            boarded_at=passenger.boarded_at.isoformat() if passenger.boarded_at else datetime.now().isoformat(),
            status=passenger.status.value
        )
        
        return self._publish(
            EventType.PASSENGER_BOARDED.value,
            event_data.model_dump()
        )
    
    def publish_passenger_removed(self, passenger: TripPassenger, trip: Trip, reason: str) -> bool:
        """
        Publica evento: passenger.removed
        
        Consumidores:
        - Notification Service (notificar remoción)
        - Payment Service (manejar reembolso si aplica)
        """
        event_data = PassengerRemovedEvent(
            trip_id=passenger.trip_id,
            route_id=trip.route_id,
            passenger_id=passenger.id,
            student_id=passenger.student_id,
            reason=reason,
            current_passenger_count=trip.current_passenger_count
        )
        
        return self._publish(
            EventType.PASSENGER_REMOVED.value,
            event_data.model_dump()
        )
# Instancia global del publisher
event_publisher = EventPublisher()


