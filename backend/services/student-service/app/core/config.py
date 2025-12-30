from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SERVICE_NAME: str = "student-service"
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@postgres:5432/uce_student"

    # Debe ser el mismo secret que Auth usa para firmar el token
    JWT_SECRET_KEY: str = "super-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "uce-safe-ride"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
