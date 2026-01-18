import threading
from app.messaging.rabbitmq.consumer import start_consumer

def start_consumer_thread(loop):
    thread = threading.Thread(
        target=start_consumer,
        args=(loop,),
        daemon=True
    )
    thread.start()
