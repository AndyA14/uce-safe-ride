from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status,Depends
import asyncio
from contextlib import asynccontextmanager
from urllib.parse import parse_qs
from app.websocket.manager import manager
from app.messaging.rabbitmq.thread import start_consumer, stop_consumer
from app.core.jwt import decode_token 
from app.websocket.dependencies import get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Iniciando WebSocket Gateway con Seguridad JWT...")
    loop = asyncio.get_running_loop()
    start_consumer(loop)
    yield
    stop_consumer()

app = FastAPI(
    title="WebSocket Gateway",
    lifespan=lifespan
)

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user: dict = Depends(get_current_user)
):
    if user is None:
        return
    student_id = user.get("sub")
    
    print(f"✅ Conexión aceptada para estudiante real: {student_id}")
    
    await websocket.accept()
    await manager.connect(student_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(student_id, websocket)
    except Exception as e:
        print(f"❌ Error: {e}")
        manager.disconnect(student_id, websocket)
        
@app.get("/")
async def root():
    return {"message": "Secure WebSocket Gateway is running"}