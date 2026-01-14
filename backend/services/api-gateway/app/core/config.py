from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # URL de los servicios
    AUTH_SERVICE_URL: str = "http://auth-service:8001"
    DRIVER_SERVICE_URL: str = "http://driver-service:8005"
    # Puerto en el que corre el Auth Service
    AUTH_SERVICE_PORT: int = 80015
    # Puerto para el Driver Service
    DRIVER_SERVICE_PORT: int = 8005
    # Clave secreta de JWT
    JWT_SECRET_KEY: str = "super-secret-key"
    # Tiempo de expiración del token
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    # Configuración de base de datos (por si en algún momento lo necesitas)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/uce_safe_ride"
    class Config:
        # Este método nos permite que las variables se puedan cargar desde un archivo `.env`
        env_file = ".env"
# Instanciamos la configuración global
settings = Settings()
