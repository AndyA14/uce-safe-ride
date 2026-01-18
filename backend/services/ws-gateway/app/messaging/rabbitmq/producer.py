import pika
import json
from app.core.config import RABBITMQ_HOST, RABBITMQ_USER, RABBITMQ_PASSWORD

def publish_event(routing_key: str, message: dict):
    """
    Envía un mensaje a RabbitMQ (Notifications Exchange).
    """
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)
        )
        channel = connection.channel()

        # Aseguramos que el exchange exista
        channel.exchange_declare(exchange="notifications.exchange", exchange_type="topic", durable=True)

        channel.basic_publish(
            exchange="notifications.exchange",
            routing_key=routing_key,
            body=json.dumps(message)
        )
        
        connection.close()
        # print(f"📤 Evento publicado en {routing_key}")
    except Exception as e:
        print(f"❌ Error publicando evento: {e}")