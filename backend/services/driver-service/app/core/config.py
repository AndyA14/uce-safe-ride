from pydantic_settings import BaseSettings


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

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
