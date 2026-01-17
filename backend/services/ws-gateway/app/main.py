from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
import asyncio
from contextlib import asynccontextmanager
from urllib.parse import parse_qs
from app.websocket.manager import manager
from app.messaging.rabbitmq.thread import start_consumer, stop_consumer
from app.core.jwt import decode_token 


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Iniciando WebSocket Gateway con Seguridad JWT...")
    loop = asyncio.get_running_loop()
    # Pasamos el loop para que el thread pueda usarlo
    start_consumer(loop)
    yield
    stop_consumer()

app = FastAPI(
    title="WebSocket Gateway",
    lifespan=lifespan
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    query_string = websocket.scope.get("query_string", b"").decode("utf-8")
    query_params = parse_qs(query_string)
    token = query_params.get("token", [None])[0]

    if not token:
        print("⛔ Conexión rechazada: No se envió token.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    payload = decode_token(token)
    if not payload:
        print("⛔ Conexión rechazada: Token inválido o expirado.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    student_id = payload.get("sub")
    
    if not student_id:
        print("⛔ Conexión rechazada: Token no contiene 'sub' (ID).")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    await manager.connect(student_id, websocket)
    print(f"✅ Estudiante autenticado y conectado: {student_id}")

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        print(f"👋 Estudiante desconectado: {student_id}")
        manager.disconnect(student_id, websocket)
    except Exception as e:
        print(f"❌ Error en conexión: {e}")
        manager.disconnect(student_id, websocket)

@app.get("/")
async def root():
    return {"message": "Secure WebSocket Gateway is running"}