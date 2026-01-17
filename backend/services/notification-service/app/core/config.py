import os

# --------------------------
# Mongo
# --------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "notification_db")

# --------------------------
# Kafka
# --------------------------
KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS",
    "kafka:9092"
)

# Topics separados por coma en Docker
KAFKA_TOPICS = os.getenv(
    "KAFKA_TOPICS",
    "route.started,bus.near_stop,payment.completed"
).split(",")
