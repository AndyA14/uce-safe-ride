# app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API
    PROJECT_NAME: str = "Trip Service - UCE Safe Ride"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    DB_ECHO: bool = False
    
    # JWT
    SECRET_KEY: Optional[str] = None  # Alias para evitar errores si usas SECRET_KEY en docker
    JWT_ISSUER: Optional[str] = None  # Para validar el emisor uce-safe-ride
    JWT_SECRET_KEY: str = "super-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # --- AGREGADO: RabbitMQ (Necesario para tu arquitectura WS) ---
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    RABBITMQ_PORT: int = 5672
    # -------------------------------------------------------------

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC_TRIPS: str = "trips"
    KAFKA_ENABLED: bool = True
    
    # External Services
    AUTH_SERVICE_URL: str = "http://auth-service:8000"
    ROUTE_SERVICE_URL: str = "http://route-service:8000"
    DRIVER_SERVICE_URL: str = "http://driver-service:8000"
    VEHICLE_SERVICE_URL: str = "http://vehicle-service:8000"
    STUDENT_SERVICE_URL: str = "http://student-service:8000"
    STOP_SERVICE_URL: str = "http://stop-service:8000"
    
    EXTERNAL_SERVICE_TIMEOUT: int = 5
    
    # Business Rules
    MAX_PASSENGERS_DEFAULT: int = 40
    MIN_ADVANCE_BOOKING_MINUTES: int = 15
    MAX_ADVANCE_BOOKING_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()