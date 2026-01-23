from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str


    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "default-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "uce-safe-ride"

    VEHICLE_SERVICE_URL: str = "http://vehicle-service:8000/api/v1"
    CORS_ORIGINS: str = "*"

settings = Settings()