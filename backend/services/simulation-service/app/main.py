from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional, List
import logging
import asyncio
import threading

from app.core.config import settings
from app.simulator import TripSimulator
from app.bridge import MQTTKafkaBridge

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Instancias globales
simulator: Optional[TripSimulator] = None
bridge: Optional[MQTTKafkaBridge] = None
bridge_thread: Optional[threading.Thread] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events"""
    global simulator, bridge, bridge_thread
    
    # Startup
    logger.info("🚀 Iniciando Simulation Service...")
    
    # Inicializar simulador
    simulator = TripSimulator()
    logger.info("✅ Simulador inicializado")
    
    # Inicializar bridge en thread separado
    if settings.KAFKA_ENABLED:
        bridge = MQTTKafkaBridge()
        bridge_thread = threading.Thread(target=bridge.start, daemon=True)
        bridge_thread.start()
        logger.info("✅ Bridge MQTT→Kafka iniciado")
    
    logger.info("✅ Simulation Service listo")
    
    yield
    
    # Shutdown
    logger.info("🛑 Cerrando Simulation Service...")
    
    if simulator:
        simulator.cleanup()
    
    if bridge:
        bridge.stop()
    
    logger.info("👋 Simulation Service cerrado")


# Crear aplicación
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Schemas ====================

class SimulationStartRequest(BaseModel):
    """Request para iniciar simulación"""
    trip_id: int
    route_id: str
    driver_id: str


class SimulationStopRequest(BaseModel):
    """Request para detener simulación"""
    trip_id: int


class SimulationStatusResponse(BaseModel):
    """Response del estado de simulación"""
    trip_id: int
    status: str  # "active" | "inactive"
    message: str


# ==================== Endpoints ====================

@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "simulation-service",
        "version": settings.VERSION,
        "mqtt_connected": simulator.mqtt_publisher.connected if simulator else False,
        "active_simulations": len(simulator.active_simulations) if simulator else 0
    }


@app.post("/simulation/start", response_model=SimulationStatusResponse)
async def start_simulation(request: SimulationStartRequest):
    """
    Inicia la simulación de un viaje.
    
    El servicio:
    1. Obtiene la ruta desde Route Service
    2. Decodifica el polyline de Google Maps
    3. Inicia un loop que publica ubicaciones cada 2 segundos a MQTT
    4. El bridge MQTT→Kafka reenvía a Kafka para consumidores
    """
    if not simulator:
        raise HTTPException(500, "Simulador no inicializado")
    
    try:
        success = await simulator.start_simulation(
            trip_id=request.trip_id,
            route_id=request.route_id,
            driver_id=request.driver_id
        )
        
        if success:
            return SimulationStatusResponse(
                trip_id=request.trip_id,
                status="active",
                message=f"Simulación iniciada para trip {request.trip_id}"
            )
        else:
            raise HTTPException(
                400,
                f"No se pudo iniciar simulación para trip {request.trip_id}"
            )
            
    except Exception as e:
        logger.error(f"Error iniciando simulación: {e}")
        raise HTTPException(500, f"Error: {str(e)}")


@app.post("/simulation/stop", response_model=SimulationStatusResponse)
async def stop_simulation(request: SimulationStopRequest):
    """Detiene la simulación de un viaje"""
    if not simulator:
        raise HTTPException(500, "Simulador no inicializado")
    
    try:
        success = await simulator.stop_simulation(request.trip_id)
        
        if success:
            return SimulationStatusResponse(
                trip_id=request.trip_id,
                status="inactive",
                message=f"Simulación detenida para trip {request.trip_id}"
            )
        else:
            raise HTTPException(
                404,
                f"No hay simulación activa para trip {request.trip_id}"
            )
            
    except Exception as e:
        logger.error(f"Error deteniendo simulación: {e}")
        raise HTTPException(500, f"Error: {str(e)}")


@app.get("/simulation/status/{trip_id}", response_model=SimulationStatusResponse)
async def get_simulation_status(trip_id: int):
    """Obtiene el estado de simulación de un viaje"""
    if not simulator:
        raise HTTPException(500, "Simulador no inicializado")
    
    is_active = trip_id in simulator.active_simulations
    
    return SimulationStatusResponse(
        trip_id=trip_id,
        status="active" if is_active else "inactive",
        message=(
            f"Simulación activa" if is_active 
            else f"Sin simulación activa"
        )
    )


@app.get("/simulation/active", response_model=List[int])
async def list_active_simulations():
    """Lista todas las simulaciones activas"""
    if not simulator:
        raise HTTPException(500, "Simulador no inicializado")
    
    return simulator.get_active_simulations()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
