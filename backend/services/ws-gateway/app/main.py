from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.exceptions import WebSocketException
import asyncio
import json
from contextlib import asynccontextmanager
from app.websocket.manager import manager
from app.messaging.rabbitmq.thread import start_consumer, stop_consumer
from app.core.jwt import decode_token 
from app.websocket.dependencies import get_current_user
from fastapi.concurrency import run_in_threadpool  
from app.messaging.rabbitmq.producer import publish_event  

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

# Endpoint de WebSocket para manejar conexiones
@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user: dict = Depends(get_current_user)
):
    if user is None:
        await websocket.close(code=1008)  # Cerrar conexión si el usuario no es válido.
        return
    
    student_id = user.get("sub")
    print(f"Conexión aceptada para estudiante real: {student_id}")
    
    # Aceptamos la conexión WebSocket
    await websocket.accept()
    await manager.connect(student_id, websocket)
    
    # Enviamos un mensaje de bienvenida
    await websocket.send_json({
        "type": "connection.established", 
        "message": "Conectado al Gateway"
    })

    try:
        while True:
            # Recibimos mensaje del cliente (Frontend)
            data_text = await websocket.receive_text()
            
            try:
                data = json.loads(data_text)
                action = data.get("action")
                
                # Lógica de suscripción
                if action == "subscribe":
                    topic = data.get("topic")  # Ej: "route-123" o "bus-55"
                    if topic:
                        await manager.subscribe(student_id, topic)
                        await websocket.send_json({
                            "type": "subscription.success", 
                            "topic": topic
                        })
                
                # Lógica de desuscripción
                elif action == "unsubscribe":
                    topic = data.get("topic")
                    if topic:
                        await manager.unsubscribe(student_id, topic)
                        await websocket.send_json({
                            "type": "unsubscription.success", 
                            "topic": topic
                        })
                elif action == "publish":
                    # Validamos rol por seguridad (solo conductores pueden publicar)
                    if user.get("role") != "DRIVER":
                        print(f"⛔ Intento de publicación no autorizado: {student_id}")
                        continue

                    routing_key = data.get("routing_key", "route.update")
                    payload = data.get("payload", {})
                    
                    # Inyectamos datos de confianza (quién lo envía)
                    payload["driver_id"] = student_id
                    
                    # Ejecutamos el envío a RabbitMQ en un hilo aparte para no bloquear el WS
                    await run_in_threadpool(publish_event, routing_key, payload)
                    await websocket.send_json({
                        "type": "publish.success", 
                        "message": "Evento publicado con éxito"
                    })

            except json.JSONDecodeError:
                # Si no podemos parsear el mensaje, lo ignoramos.
                print("Mensaje no válido recibido")
                continue

    except WebSocketDisconnect:
        # Manejo de desconexión
        print(f"WebSocket desconectado para el estudiante: {student_id}")
        await manager.disconnect(student_id, websocket)
    
    except Exception as e:
        # Manejo de errores inesperados
        print(f"Error en WebSocket: {e}")
        await manager.disconnect(student_id, websocket)

@app.get("/")
async def root():
    return {"message": "Secure WebSocket Gateway is running"}
