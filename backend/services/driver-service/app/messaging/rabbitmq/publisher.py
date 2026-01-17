import pika
import json
import os

def publish_notification(event: dict):
    credentials = pika.PlainCredentials(
        os.getenv("RABBITMQ_USER"),
        os.getenv("RABBITMQ_PASSWORD")
    )

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=os.getenv("RABBITMQ_HOST"),
            credentials=credentials
        )
    )

    channel = connection.channel()

    channel.exchange_declare(
        exchange="notifications.exchange",
        exchange_type="topic",
        durable=True
    )

    routing_key = event["type"]

    channel.basic_publish(
        exchange="notifications.exchange",
        routing_key=routing_key,
        body=json.dumps(event)
    )

    connection.close()
