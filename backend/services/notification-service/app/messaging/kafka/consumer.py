import json
import time
from datetime import datetime
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from core.config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_TOPICS
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

                    notification = {
                        "type": message.topic,
                        "title": f"Event: {message.topic}",
                        "message": event.get("message", "New event received"),
                        "user_id": event.get("user_id"),
                        "metadata": event,
                        "created_at": datetime.utcnow(),
                    }

                    result = notifications_collection.insert_one(notification)
                    print(f"Notification stored: {str(result.inserted_id)}")

                except Exception as e:
                    print("Error storing notification:", e)

        except NoBrokersAvailable:
            print("Kafka brokers not available. Retrying in 5 seconds...")
            time.sleep(5)

        except Exception as e:
            print("Unexpected error in Kafka consumer:", e)
            time.sleep(5)
