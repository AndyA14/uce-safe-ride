from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración del servicio de simulación"""
    
    # Service Info
    PROJECT_NAME: str = "Simulation Service - UCE Safe Ride"
    VERSION: str = "1.0.0"
    
    # External Services
    TRIP_SERVICE_URL: str = "http://trip-service:8000"
    ROUTE_SERVICE_URL: str = "http://route-service:8000"
    
    # MQTT Configuration
    MQTT_BROKER: str = "mosquitto"
    MQTT_PORT: int = 1883
    MQTT_TOPIC: str = "uce/trips/location"
    MQTT_CLIENT_ID: str = "simulation-service"
    
    # Kafka Configuration
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_TOPIC_TRIPS: str = "trips"
    KAFKA_ENABLED: bool = True
    
    # Simulation Parameters
    SIMULATION_INTERVAL: float = 2.0  # Segundos entre puntos
    SIMULATION_SPEED_MULTIPLIER: float = 1.0  # Multiplicador de velocidad
    
    # Fallback Configuration (para rutas sin polyline)
    FALLBACK_POINTS_COUNT: int = 20  # Puntos intermedios en línea recta
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
