import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # --- MongoDB ---
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://mongo:27017")
    MONGO_DB: str = os.getenv("MONGO_DB", "notification_db")

    # --- Kafka (Para Tracking GPS) ---
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
    # El simulador envía aquí:
    KAFKA_TOPIC_TRIPS: str = "trip.location.updated"

    # --- RabbitMQ (Para Eventos de Negocio) ---
    # ¡Aquí lo rescatamos! No está pintado.
    RABBITMQ_HOST: str = os.getenv("RABBITMQ_HOST", "rabbitmq")
    RABBITMQ_USER: str = os.getenv("RABBITMQ_USER", "uce")
    RABBITMQ_PASSWORD: str = os.getenv("RABBITMQ_PASSWORD", "uce123")
    RABBITMQ_PORT: int = int(os.getenv("RABBITMQ_PORT", 5672))

    class Config:
        case_sensitive = True

# Exportamos la instancia única
settings = Settings()