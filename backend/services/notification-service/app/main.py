from fastapi import FastAPI
from api.v1.router import api_router
from messaging.kafka.consumer import start_kafka_consumer
import threading

app = FastAPI(
    title="Notification Service",
    description="Service that listens to Kafka events and stores notifications in MongoDB",
    version="1.0.0"
)

# Incluye las rutas del API
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
def startup_event():
    thread = threading.Thread(
        target=start_kafka_consumer,
        daemon=True,
        name="KafkaConsumerThread"
    )
    thread.start()
    print("Kafka consumer thread started.")
