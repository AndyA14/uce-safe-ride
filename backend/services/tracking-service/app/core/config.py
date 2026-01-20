from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "UCE Tracking Service"
    
    # MongoDB
    MONGO_URI: str = "mongodb://mongo:27017"
    MONGO_DB: str = "tracking_db"

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_TOPIC_TRIPS: str = "trips"
    KAFKA_GROUP_ID: str = "tracking_service_group"

    class Config:
        case_sensitive = True

settings = Settings()