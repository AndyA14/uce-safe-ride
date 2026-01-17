import pika
import json
import time
import asyncio
from app.core.config import RABBITMQ_HOST, RABBITMQ_USER, RABBITMQ_PASSWORD
from app.websocket.manager import manager

def start_rabbit_consumer(loop, stop_event):
    while not stop_event.is_set():
        try:
            print("🐰 Conectando a RabbitMQ...")

            # Credenciales de conexión
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)

            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    credentials=credentials,
                    heartbeat=600,
                    blocked_connection_timeout=300
                )
            )
            # Establecemos el canal y declaramos el exchange
            channel = connection.channel()
            channel.exchange_declare(
                exchange="notifications.exchange",
                exchange_type="topic",
                durable=True
            )
            # Declaramos la cola de manera exclusiva para este consumidor
            result = channel.queue_declare(queue="", exclusive=True)
            queue_name = result.method.queue
            # Vinculamos la cola al exchange con la clave de enrutamiento "#", que recibe todos los eventos
            channel.queue_bind(
                exchange="notifications.exchange",
                queue=queue_name,
                routing_key="#"
            )
            print(f"🐰 Consumidor RabbitMQ iniciado en la cola {queue_name} vinculado a '#'")

            def callback(ch, method, properties, body):
                """Callback para procesar mensajes entrantes."""
                try:
                    event = json.loads(body)

                    # Lógica de filtrado por tipo de evento
                    target_student = event.get("student_id")
                    target_route = event.get("route_id")
                    target_bus = event.get("bus_id")

                    # CASO A: Mensaje personal para un estudiante
                    if target_student:
                        print(f"Enviando mensaje al estudiante {target_student}")
                        asyncio.run_coroutine_threadsafe(
                            manager.send_to_student(target_student, event),
                            loop
                        )

                    # CASO B: Evento relacionado con una ruta
                    elif target_route:
                        topic = f"route-{target_route}"
                        print(f"Broadcasting a tópico: {topic}")
                        asyncio.run_coroutine_threadsafe(
                            manager.broadcast_to_topic(topic, event),
                            loop
                        )

                    # CASO C: Evento relacionado con un bus
                    elif target_bus:
                        topic = f"bus-{target_bus}"
                        print(f"📡 Broadcasting a tópico: {topic}")
                        asyncio.run_coroutine_threadsafe(
                            manager.broadcast_to_topic(topic, event),
                            loop
                        )
                except Exception as e:
                    print(f"Error procesando evento RabbitMQ: {e}")

            # Consumimos los mensajes de la cola
            channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback,
                auto_ack=True
            )
            # Procesamos eventos hasta que se detenga el consumidor
            while not stop_event.is_set():
                connection.process_data_events(time_limit=1)

            print("Deteniendo consumidor RabbitMQ...")
            if connection.is_open:
                connection.close()

        except pika.exceptions.AMQPConnectionError:
            print("RabbitMQ no disponible. Reintentando en 5 segundos...")
            time.sleep(5)

        except Exception as e:
            print(f"Error inesperado con RabbitMQ: {e}")
            time.sleep(5)
