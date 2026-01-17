from fastapi import FastAPI, WebSocket
import asyncio
from contextlib import asynccontextmanager
from websocket.manager import manager
from messaging.rabbitmq.thread import start_consumer, stop_consumer

@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    start_consumer(loop)
    yield
    stop_consumer()

app = FastAPI(
    title="WebSocket Gateway",
    lifespan=lifespan
)

@app.websocket("/ws/{student_id}")
async def websocket_endpoint(websocket: WebSocket, student_id: str):
    await websocket.accept()
    await manager.connect(student_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(student_id, websocket)
