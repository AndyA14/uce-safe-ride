from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.sessions import get_db
from app.core.kafka_producer import kafka_producer
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def health_check():
    """Health check básico"""
    return {
        "status": "healthy",
        "service": "trip-service"
    }


@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness check: verifica que el servicio esté listo para recibir tráfico
    """
    # Verificar conexión a base de datos
    try:
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Verificar Kafka
    kafka_status = "enabled" if kafka_producer.enabled else "disabled"
    
    is_ready = db_status == "connected"
    
    return {
        "status": "ready" if is_ready else "not_ready",
        "checks": {
            "database": db_status,
            "kafka": kafka_status
        }
    }


@router.get("/live")
async def liveness_check():
    """
    Liveness check: verifica que el servicio esté vivo
    """
    return {
        "status": "alive"
    }
