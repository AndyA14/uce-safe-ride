from fastapi import APIRouter
from app.db.mongo import db

router = APIRouter()

@router.get("/")
async def health_check():
    """
    Verifica estado de servicio y conexión a BD
    """
    mongo_status = "disconnected"
    if db.client:
        try:
            await db.database.command("ping")
            mongo_status = "connected"
        except:
            mongo_status = "error"
            
    return {
        "status": "ok",
        "service": "tracking-service",
        "database": mongo_status
    }