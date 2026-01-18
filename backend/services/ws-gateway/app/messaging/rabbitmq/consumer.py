import pika
import time
import json
import threading
from app.core.config import settings

def start_consumer(on_message_callback):
    while True:
        try:
            print("🐰 Connecting to RabbitMQ (consumer)...")

            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=settings.RABBITMQ_HOST,
                    port=settings.RABBITMQ_PORT,
                    credentials=pika.PlainCredentials(
                        settings.RABBITMQ_USER,
                        settings.RABBITMQ_PASSWORD
                    )
                )
            )

            channel = connection.channel()

            channel.exchange_declare(
                exchange="notifications.exchange",
                exchange_type="topic",
                durable=True
            )

            result = channel.queue_declare(queue="", exclusive=True)
            queue_name = result.method.queue

            channel.queue_bind(
                exchange="notifications.exchange",
                queue=queue_name,
                routing_key="#"
            )

            print(f"🐰 RabbitMQ consumer started on queue {queue_name}")

            def callback(ch, method, properties, body):
                payload = json.loads(body)
                on_message_callback(payload)

            channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback,
                auto_ack=True
            )

            channel.start_consuming()

        except pika.exceptions.AMQPConnectionError:
            print("❌ RabbitMQ not available. Retrying in 5 seconds...")
            time.sleep(5)
