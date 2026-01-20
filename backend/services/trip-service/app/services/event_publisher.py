import logging
from datetime import datetime
from typing import Optional, Union, Any

from app.db.models import Trip, Passenger
from app.core.kafka_producer import kafka_producer
from app.core.config import settings
from app.core.events import EventType
from app.schemas.events import (
    TripCreatedEvent,
    TripStartedEvent,
    TripCompletedEvent,
    TripCancelledEvent,
    TripLocationUpdatedEvent,
    PassengerJoinedEvent,
    PassengerBoardedEvent,
    PassengerRemovedEvent,
    LocationData
)

logger = logging.getLogger(__name__)


class EventPublisher:
    def __init__(self):
        self.topic = settings.KAFKA_TOPIC_TRIPS
        self.enabled = settings.KAFKA_ENABLED

    # =====================================================
    # MÉTODO BASE
    # =====================================================

    def _publish(self, event_type: str, data: dict, key: Optional[str] = None) -> bool:
        if not self.enabled:
            logger.warning(f"Kafka deshabilitado. Evento {event_type} no publicado.")
            return False

        event_envelope = {
            "event_type": event_type,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }

        if key is None and "trip_id" in data:
            key = str(data["trip_id"])

        try:
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
        except Exception as e:
            logger.error(f"Excepción crítica publicando en Kafka: {e}")
            return False

    def _get_status_value(self, status_obj: Any) -> str:
        return status_obj.value if hasattr(status_obj, "value") else str(status_obj)

    # =====================================================
    # TRIP EVENTS
    # =====================================================

    def publish_trip_created(self, trip: Union[Trip, TripCreatedEvent]) -> bool:
        if hasattr(trip, "trip_id"):
            return self._publish(EventType.TRIP_CREATED.value, trip.model_dump())

        event_data = TripCreatedEvent(
            trip_id=trip.id,
            route_id=str(trip.route_id),
            driver_id=str(trip.driver_id),
            vehicle_id=str(trip.vehicle_id),
            scheduled_start_time=trip.scheduled_start_time.isoformat(),
            max_passengers=trip.max_passengers,
            status=self._get_status_value(trip.status)
        )
        return self._publish(EventType.TRIP_CREATED.value, event_data.model_dump())

    def publish_trip_started(self, trip: Union[Trip, TripStartedEvent]) -> bool:
        if hasattr(trip, "trip_id"):
            return self._publish(EventType.TRIP_STARTED.value, trip.model_dump())

        event_data = TripStartedEvent(
            trip_id=trip.id,
            route_id=str(trip.route_id),
            driver_id=str(trip.driver_id),
            vehicle_id=str(trip.vehicle_id),
            actual_start_time=trip.actual_start_time.isoformat()
            if trip.actual_start_time else datetime.now().isoformat(),
            initial_location=LocationData(
                latitude=trip.current_latitude or 0.0,
                longitude=trip.current_longitude or 0.0
            ),
            status=self._get_status_value(trip.status)
        )
        return self._publish(EventType.TRIP_STARTED.value, event_data.model_dump())

    def publish_trip_completed(self, trip: Union[Trip, TripCompletedEvent]) -> bool:
        if hasattr(trip, "trip_id"):
            return self._publish(EventType.TRIP_COMPLETED.value, trip.model_dump())

        event_data = TripCompletedEvent(
            trip_id=trip.id,
            route_id=str(trip.route_id),
            driver_id=str(trip.driver_id),
            vehicle_id=str(trip.vehicle_id),
            actual_start_time=trip.actual_start_time.isoformat()
            if trip.actual_start_time else None,
            actual_end_time=trip.actual_end_time.isoformat()
            if trip.actual_end_time else datetime.now().isoformat(),
            passenger_count=trip.current_passenger_count,
            final_location=LocationData(
                latitude=trip.current_latitude or 0.0,
                longitude=trip.current_longitude or 0.0
            ),
            status=self._get_status_value(trip.status)
        )
        return self._publish(EventType.TRIP_COMPLETED.value, event_data.model_dump())

    def publish_trip_cancelled(
        self,
        trip: Union[Trip, TripCancelledEvent],
        reason: str = ""
    ) -> bool:
        if hasattr(trip, "trip_id"):
            return self._publish(EventType.TRIP_CANCELLED.value, trip.model_dump())

        event_data = TripCancelledEvent(
            trip_id=trip.id,
            route_id=str(trip.route_id),
            driver_id=str(trip.driver_id),
            reason=reason,
            status=self._get_status_value(trip.status)
        )
        return self._publish(EventType.TRIP_CANCELLED.value, event_data.model_dump())

    def publish_trip_location_updated(
        self,
        trip: Union[Trip, TripLocationUpdatedEvent]
    ) -> bool:
        if hasattr(trip, "trip_id"):
            return self._publish(
                EventType.TRIP_LOCATION_UPDATED.value,
                trip.model_dump()
            )

        event_data = TripLocationUpdatedEvent(
            trip_id=trip.id,
            route_id=str(trip.route_id),
            driver_id=str(trip.driver_id),
            location=LocationData(
                latitude=trip.current_latitude,
                longitude=trip.current_longitude
            ),
            timestamp=trip.last_location_update.isoformat()
            if trip.last_location_update else datetime.now().isoformat()
        )
        return self._publish(
            EventType.TRIP_LOCATION_UPDATED.value,
            event_data.model_dump()
        )

    # =====================================================
    # PASSENGER EVENTS  ✅ USA Passenger (NO TripPassenger)
    # =====================================================

    def publish_passenger_joined(self, passenger: Passenger, trip: Trip) -> bool:
        event_data = PassengerJoinedEvent(
            trip_id=passenger.trip_id,
            route_id=str(trip.route_id),
            passenger_id=passenger.id,
            student_id=str(passenger.student_id),
            stop_id=str(passenger.stop_id),
            fare_amount=passenger.fare_amount,
            status=self._get_status_value(passenger.status),
            current_passenger_count=trip.current_passenger_count
        )
        return self._publish(
            EventType.PASSENGER_JOINED.value,
            event_data.model_dump()
        )

    def publish_passenger_boarded(self, passenger: Passenger, trip: Trip) -> bool:
        event_data = PassengerBoardedEvent(
            trip_id=passenger.trip_id,
            route_id=str(trip.route_id),
            passenger_id=passenger.id,
            student_id=str(passenger.student_id),
            boarded_at=passenger.boarded_at.isoformat()
            if passenger.boarded_at else datetime.now().isoformat(),
            status=self._get_status_value(passenger.status)
        )
        return self._publish(
            EventType.PASSENGER_BOARDED.value,
            event_data.model_dump()
        )

    def publish_passenger_removed(
        self,
        passenger: Passenger,
        trip: Trip,
        reason: str
    ) -> bool:
        event_data = PassengerRemovedEvent(
            trip_id=passenger.trip_id,
            route_id=str(trip.route_id),
            passenger_id=passenger.id,
            student_id=str(passenger.student_id),
            reason=reason,
            current_passenger_count=trip.current_passenger_count
        )
        return self._publish(
            EventType.PASSENGER_REMOVED.value,
            event_data.model_dump()
        )
event_publisher = EventPublisher()
