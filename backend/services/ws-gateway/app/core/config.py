import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "uce")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "uce123")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-change-me") 
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")