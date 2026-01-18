from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    RABBITMQ_HOST: str = "rabbitmq"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "uce"
    RABBITMQ_PASSWORD: str = "uce"


    JWT_SECRET_KEY: str = "super-secret"
    JWT_ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
settings = Settings()
