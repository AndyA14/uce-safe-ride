from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
import asyncio
from contextlib import asynccontextmanager

# Importación correcta para Kafka Consumer
from app.messaging.kafka_consumer import consume_location_events
from app.websocket.manager import manager
from app.websocket.redis_listener import redis_listener
from app.core.jwt import decode_token

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Iniciando WebSocket Gateway (Redis + Kafka)")
    
    # Iniciar escuchas en background
    task_redis = asyncio.create_task(redis_listener())  # Redis listener
    task_kafka = asyncio.create_task(consume_location_events())  # Kafka consumer
    
    try:
        yield
    finally:
        print("🛑 Deteniendo servicios de mensajería...")
        task_redis.cancel()  # Cancelar la tarea de Redis
        task_kafka.cancel()  # Cancelar la tarea de Kafka

app = FastAPI(
    title="WebSocket Gateway",
    lifespan=lifespan
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")
    
    # Validación de token
    if not token:
        print("❌ Intento de conexión sin token")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Decodificación del token y manejo de errores
    try:
        user = decode_token(token)  # Asumiendo que tienes un decode_token para verificar el token
        if not user:
            print("❌ Token inválido")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id = user.get("sub")
    except Exception as e:
        print(f"⚠️ Error validando token: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # ==================================================================
    # 🚨 PASO CRÍTICO: ACEPTAR LA CONEXIÓN ANTES DE AGREGAR AL MANAGER
    # ==================================================================
    await websocket.accept()  # Aceptar la conexión WebSocket

    # Ahora que la conexión está aceptada, agregar al manager
    await manager.connect(user_id, websocket)
    
    print(f"🟢 Conexión WebSocket establecida → user={user_id}")

    try:
        while True:
            # Mantener la conexión activa escuchando (aunque no esperemos datos del cliente)
            data = await websocket.receive_text()
            # Si el cliente envía algo (ping), respondemos o simplemente ignoramos

    except WebSocketDisconnect:
        # Desconectar cuando el WebSocket se cierre
        manager.disconnect(user_id)
        print(f"🔴 WebSocket desconectado → user={user_id}")

    except Exception as e:
        # Manejo de errores inesperados
        print(f"❌ Error en WebSocket: {e}")
        manager.disconnect(user_id)
