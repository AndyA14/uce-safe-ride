import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "uce")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "uce123")
