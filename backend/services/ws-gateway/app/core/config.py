from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    RABBITMQ_HOST: str = "rabbitmq"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "uce"
    RABBITMQ_PASSWORD: str = "uce"

    # Kafka Config
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_TOPIC_TRIPS: str = "trips"
    KAFKA_GROUP_ID: str = "ws_gateway_group"
    KAFKA_TOPIC_ALERTS: str = "notification.alerts"

    JWT_SECRET_KEY: str = "super-secret"
    JWT_ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
settings = Settings()
