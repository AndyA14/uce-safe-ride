import time
from pymongo import MongoClient, errors
from core.config import MONGO_URI, MONGO_DB

def get_mongo_client(uri: str, max_retries: int = 5, retry_delay: int = 5) -> MongoClient:
    retries = 0
    while retries < max_retries:
        try:
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Forzar verificación de conexión
            client.admin.command("ping")
            print("Connected to MongoDB at", uri)
            return client
        except errors.ServerSelectionTimeoutError as e:
            retries += 1
            print(f"MongoDB not available (attempt {retries}/{max_retries}). Retrying in {retry_delay}s...")
            time.sleep(retry_delay)

    raise ConnectionError(f"Could not connect to MongoDB at {uri} after {max_retries} attempts.")

# Crear cliente y base de datos
client = get_mongo_client(MONGO_URI)
db = client[MONGO_DB]

# Colección de notificaciones
notifications_collection = db["notifications_log"]
