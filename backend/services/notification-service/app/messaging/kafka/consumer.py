from datetime import datetime
import json
import time
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from core.config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_TOPICS
from services.notification_service import process_event
from messaging.rabbitmq.publisher import publish_notification  
from db.mongo import notifications_collection 

def start_kafka_consumer():
    print("Starting Kafka consumer for Notification Service...")

    while True:
        try:
            consumer = KafkaConsumer(
                *KAFKA_TOPICS,
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                group_id="notification-service",
                auto_offset_reset="earliest",
                enable_auto_commit=True,
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                api_version_auto_timeout_ms=30000,
            )

            print("📡 Connected to Kafka. Listening to topics:", KAFKA_TOPICS)

            for message in consumer:
                try:
                    event = message.value
                    print(f"📩 Event received from {message.topic}: {event}")

                    # Procesamos el evento (lógica de negocio extra si la hay)
                    process_event(event)

                    # Creamos el objeto de notificación
                    notification = {
                        "event_type": message.topic,
                        "title": f"Event: {message.topic}",
                        "message": event.get("message", "New event received"),
                        "student_id": event.get("student_id", "test-student"),
                        "metadata": event,
                        "created_at": datetime.utcnow().isoformat(),
                    }

                    notifications_collection.insert_one(notification)
                    print("Notification saved to MongoDB")

                    notification["_id"] = str(notification["_id"])

                    # 2. Publicamos en RabbitMQ
                    publish_notification(notification)
                    print("Notification published to RabbitMQ")

                except Exception as e:
                    print("Error processing event:", e)

        except NoBrokersAvailable:
            print("Kafka brokers not available. Retrying in 5 seconds...")
            time.sleep(5)

        except Exception as e:
            print("Unexpected error in Kafka consumer:", e)
            time.sleep(5)