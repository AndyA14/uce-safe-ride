from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
import asyncio
from contextlib import asynccontextmanager
from fastapi.concurrency import run_in_threadpool

from app.websocket.manager import manager
from app.messaging.rabbitmq.producer import publish_event
from app.websocket.redis_listener import redis_listener
from app.core.jwt import decode_token

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Iniciando WebSocket Gateway + Redis")
    task = asyncio.create_task(redis_listener())
    try:
        yield
    finally:
        task.cancel()

app = FastAPI(
    title="WebSocket Gateway",
    lifespan=lifespan
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        user = decode_token(token)
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = user.get("sub")
    role = user.get("role")

    if not user_id or not role:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    await websocket.accept()
    await manager.connect(user_id, websocket)
    
    print(f"🟢 WS conectado → user={user_id}, role={role}")

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            # 🟢 SUBSCRIBE explícito
            if action == "subscribe":
                route_id = data.get("route_id")
                if not route_id:
                    continue

                await manager.subscribe(user_id, route_id)
                await websocket.send_json({
                    "type": "subscription.success",
                    "route_id": route_id
                })
            # 🚌 DRIVER publica ubicación
            elif action == "publish":
                if role != "DRIVER": 
                    continue

                payload = data.get("payload", {})
                payload["driver_id"] = user_id

                await run_in_threadpool(
                    publish_event,
                    data.get("routing_key", "route.event"),
                    payload
                )

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        print(f"🔴 WS desconectado → {user_id}")
        
    except Exception as e:
        print(f"❌ Error en WS: {e}")
        manager.disconnect(user_id)