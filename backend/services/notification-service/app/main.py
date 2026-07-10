from fastapi import FastAPI
from contextlib import asynccontextmanager
from threading import Thread

from app.messaging.kafka.consumer import start_kafka_consumer

# ✅ Importamos api_router desde la ubicación exacta que vimos en tu imagen
from app.api.v1.router import api_router

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

# ✅ Conectamos todas las rutas de la API (notifications y health)
# Al poner "/api/v1" aquí, se sumará al "/notifications" de tu router.py
app.include_router(api_router, prefix="/api/v1")

# Esta ruta se queda en la raíz (http://localhost:XXXX/health)
@app.get("/health")
def health_check():
    return {"status": "ok"}