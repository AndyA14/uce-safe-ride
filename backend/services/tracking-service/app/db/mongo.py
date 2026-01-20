from motor.motor_asyncio import AsyncIOMotorClient
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def connect_to_mongo():
    logger.info("⏳ Conectando a MongoDB...")
    try:
        db.client = AsyncIOMotorClient(settings.MONGO_URI)
        db.database = db.client[settings.MONGO_DB]
        # Verificar conexión con un comando simple
        await db.database.command("ping")
        logger.info("✅ Conectado a MongoDB exitosamente.")
    except Exception as e:
        logger.error(f"❌ Error conectando a MongoDB: {e}")
        raise e

async def close_mongo_connection():
    logger.info("🔌 Cerrando conexión a MongoDB...")
    if db.client:
        db.client.close()