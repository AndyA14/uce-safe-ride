import pika
import json
import time
import asyncio
from core.config import RABBITMQ_HOST, RABBITMQ_USER, RABBITMQ_PASSWORD
from websocket.manager import manager

def start_rabbit_consumer(loop: asyncio.AbstractEventLoop, stop_event):
    while not stop_event.is_set():
        try:
            print("🐰 Connecting to RabbitMQ...")

            credentials = pika.PlainCredentials(
                RABBITMQ_USER,
                RABBITMQ_PASSWORD
            )

            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    credentials=credentials,
                    heartbeat=600,
                    blocked_connection_timeout=300
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
                routing_key="bus.*"
            )

            print("🐰 RabbitMQ consumer started and waiting for messages")

            def callback(ch, method, properties, body):
                event = json.loads(body)
                student_id = event.get("student_id")

                if student_id:
                    asyncio.run_coroutine_threadsafe(
                        manager.send_to_student(student_id, event),
                        loop
                    )

            channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback,
                auto_ack=True
            )
            while not stop_event.is_set():
                connection.process_data_events(time_limit=1)

            print("🛑 Stopping RabbitMQ consumer...")
            channel.close()
            connection.close()

        except pika.exceptions.AMQPConnectionError:
            print("❌ RabbitMQ not available. Retrying in 5 seconds...")
            time.sleep(5)

        except Exception as e:
            print("❌ Unexpected RabbitMQ error:", e)
            time.sleep(5)
