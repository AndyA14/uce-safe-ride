import threading
import asyncio
from messaging.rabbitmq.consumer import start_rabbit_consumer

_stop_event = threading.Event()
_thread = None

def start_consumer(loop):
    global _thread

    if _thread and _thread.is_alive():
        return

    _stop_event.clear()

    _thread = threading.Thread(
        target=start_rabbit_consumer,
        args=(loop, _stop_event),
        daemon=True
    )
    _thread.start()

def stop_consumer():
    _stop_event.set()
