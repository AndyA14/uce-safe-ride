from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str

    JWT_SECRET_KEY: str = "super-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "uce-safe-ride"

settings = Settings()
