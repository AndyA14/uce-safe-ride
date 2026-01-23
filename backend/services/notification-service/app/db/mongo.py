import time
from pymongo import MongoClient, errors
# Importamos el objeto settings, NO las variables sueltas
from app.core.config import settings

def get_mongo_client(uri: str, max_retries: int = 5, retry_delay: int = 5) -> MongoClient:
    retries = 0
    while retries < max_retries:
        try:
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            client.admin.command("ping")
            print(f"✅ [Mongo] Conectado a: {uri}", flush=True)
            return client
        except errors.ServerSelectionTimeoutError:
            retries += 1
            print(f"⚠️ [Mongo] Reintentando ({retries}/{max_retries})...", flush=True)
            time.sleep(retry_delay)

    raise ConnectionError(f"❌ Fallo crítico conectando a Mongo en {uri}")

# Usamos settings.VARIABLE
client = get_mongo_client(settings.MONGO_URI)
db = client[settings.MONGO_DB]

notifications_collection = db["notifications_log"]