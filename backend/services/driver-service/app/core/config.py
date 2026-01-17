from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # Metadata del servicio
    PROJECT_NAME: str = "stop-service"

    # Base de datos
    DATABASE_URL: str

    # CORS
    # Puede venir como:
    # "http://localhost:3000,http://localhost:5173"
    # o simplemente "*"
    CORS_ORIGINS: str | None = "*"

    # Configuración de RabbitMQ
    RABBITMQ_HOST: str = "rabbitmq"
    RABBITMQ_USER: str = "uce"
    RABBITMQ_PASSWORD: str = "uce123"

    class Config:
        env_file = ".env"  # Cargar las variables del archivo .env
        case_sensitive = True


settings = Settings()  # Cargar la configuración

# Si prefieres manejar las variables directamente, puedes acceder a ellas como:
RABBITMQ_HOST = settings.RABBITMQ_HOST
RABBITMQ_USER = settings.RABBITMQ_USER
RABBITMQ_PASSWORD = settings.RABBITMQ_PASSWORD

# También puedes acceder a otros valores, por ejemplo:
DATABASE_URL = settings.DATABASE_URL
CORS_ORIGINS = settings.CORS_ORIGINS

print(f"Conectando a RabbitMQ en {RABBITMQ_HOST} con el usuario {RABBITMQ_USER}")
print(f"Conexión a base de datos: {DATABASE_URL}")
