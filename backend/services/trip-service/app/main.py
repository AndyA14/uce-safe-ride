import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from sqlalchemy.exc import OperationalError

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.sessions import engine
from app.db.base import Base

# Kafka (opcional)
from app.core.kafka_producer import kafka_producer

# Consumidor de ubicación
from app.core.location_consumer import location_consumer

# -------------------------------------------------------------------------
# LOGGING
# -------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# -------------------------------------------------------------------------
# DATABASE WAIT (FIX CRÍTICO)
# -------------------------------------------------------------------------
def wait_for_db(max_retries: int = 15, delay: int = 2) -> None:
    """
    Espera activa hasta que PostgreSQL esté disponible.
    Evita crash en Base.metadata.create_all()
    """
    retries = 0
    while retries < max_retries:
        try:
            logger.info(f"⏳ Intentando conectar a DB ({retries + 1}/{max_retries})...")
            with engine.connect():
                logger.info("✅ Base de datos conectada y lista.")
                return
        except OperationalError:
            retries += 1
            logger.warning(
                f"⚠️ DB no lista. Reintentando en {delay}s... ({retries}/{max_retries})"
            )
            time.sleep(delay)
    raise Exception("❌ No se pudo conectar a la base de datos tras varios intentos.")


# -------------------------------------------------------------------------
# LIFESPAN (STARTUP / SHUTDOWN)
# -------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ------------------ STARTUP ------------------
    logger.info(f"🚀 Iniciando {settings.PROJECT_NAME}...")

    # 1️⃣ Esperar DB (FIX DEL CRASH)
    wait_for_db()

    # 2️⃣ Crear / verificar tablas
    logger.info("📊 Creando / verificando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)

    # 3️⃣ Kafka (si está habilitado)
    if settings.KAFKA_ENABLED:
        logger.info(
            f"📡 Kafka habilitado | Bootstrap servers: {settings.KAFKA_BOOTSTRAP_SERVERS}"
        )

    # 4️⃣ Iniciar consumidor de ubicación
    try:
        logger.info("🛰️ Iniciando consumidor de ubicación...")
        await location_consumer.start()
        logger.info("✅ Consumidor de ubicación activo")
    except Exception as e:
        logger.error(f"❌ Error iniciando consumidor de ubicación: {e}")

    logger.info("✅ Trip Service listo para recibir peticiones")
    yield

    # ------------------ SHUTDOWN ------------------
    logger.info("🛑 Apagando Trip Service...")

    # Detener consumidor de ubicación
    try:
        logger.info("🛰️ Deteniendo consumidor de ubicación...")
        await location_consumer.stop()
        logger.info("✅ Consumidor de ubicación detenido")
    except Exception as e:
        logger.warning(f"⚠️ Error deteniendo consumidor de ubicación: {e}")

    # Cerrar Kafka
    try:
        kafka_producer.close()
        logger.info("📴 Kafka producer cerrado correctamente")
    except Exception:
        logger.warning("⚠️ Kafka producer no estaba inicializado")

    logger.info("👋 Trip Service apagado")


# -------------------------------------------------------------------------
# FASTAPI APP
# -------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# -------------------------------------------------------------------------
# MIDDLEWARES
# -------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------------
# ROUTERS
# -------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# -------------------------------------------------------------------------
# HEALTHCHECK
# -------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "trip-service",
        "version": settings.VERSION,
    }


# -------------------------------------------------------------------------
# GLOBAL EXCEPTION HANDLER
# -------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("❌ Error no manejado", exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Error interno del servidor",
            "type": type(exc).__name__,
        },
    )


# -------------------------------------------------------------------------
# LOCAL DEV ENTRYPOINT
# -------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8010,
        reload=True,
    )
