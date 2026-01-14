from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True
    )

    PROJECT_NAME: str = "stop-service"

    # Database
    DATABASE_URL: str

    # CORS
    # Ejemplos:
    # "*" 
    # "http://localhost:3000,http://localhost:5173"
    CORS_ORIGINS: str = "*"


settings = Settings()
