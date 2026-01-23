from fastapi import FastAPI
from contextlib import asynccontextmanager
from threading import Thread

# ✅ CORRECCIÓN: Usamos la ruta absoluta completa
from app.messaging.kafka.consumer import start_kafka_consumer

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Iniciando Notification Service")
    
    # Hilo secundario para Kafka
    consumer_thread = Thread(target=start_kafka_consumer, daemon=True)
    consumer_thread.start()
    
    yield
    
    print("🛑 Deteniendo Notification Service")

app = FastAPI(
    title="Notification Service",
    lifespan=lifespan
)

@app.get("/health")
def health_check():
    return {"status": "ok"}