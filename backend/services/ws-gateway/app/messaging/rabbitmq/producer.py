import pika
import json
from app.core.config import settings

def publish_event(routing_key: str, payload: dict):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=settings.RABBITMQ_HOST)
    )
    channel = connection.channel()

    channel.exchange_declare(
        exchange="notifications.exchange",
        exchange_type="topic",
        durable=True
    )

    channel.basic_publish(
        exchange="notifications.exchange",
        routing_key=routing_key,
        body=json.dumps(payload)
    )

    connection.close()
