from fastapi import FastAPI
from app.core.config import settings
from app.db.mongo import connect_to_mongo, close_mongo_connection 
from app.core.kafka_consumer import tracking_consumer
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    # 👇 ESTA ES LA LÍNEA QUE FALTA O FALLA 👇
    await connect_to_mongo()     
    
    # Después iniciamos el consumidor
    await tracking_consumer.start()

@app.on_event("shutdown")
async def shutdown_event():
    await tracking_consumer.stop()
    await close_mongo_connection()