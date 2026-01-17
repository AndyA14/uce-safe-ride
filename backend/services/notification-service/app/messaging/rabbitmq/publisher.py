import pika
import json
from core.config import (
    RABBITMQ_HOST,
    RABBITMQ_USER,
    RABBITMQ_PASSWORD
)

def publish_notification(event: dict):
    credentials = pika.PlainCredentials(
        RABBITMQ_USER,
        RABBITMQ_PASSWORD
    )

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            credentials=credentials
        )
    )

    channel = connection.channel()

    channel.exchange_declare(
        exchange="notifications.exchange",
        exchange_type="topic",
        durable=True
    )

    routing_key = event.get("event_type", "bus.unknown")

    channel.basic_publish(
        exchange="notifications.exchange",
        routing_key=routing_key,
        body=json.dumps(event)
    )

    connection.close()
