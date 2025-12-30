from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    SERVICE_NAME: str = "auth-service"
    ENV: str = "local"

    # Security
    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # DB
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@postgres:5432/uce_safe_ride"

    # UCE email domain constraint (for students)
    UCE_EMAIL_DOMAIN: str = "@uce.edu.ec"

settings = Settings()
