from typing import Dict, List, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, student_id: str, websocket: WebSocket):
        if student_id not in self.active_connections:
            self.active_connections[student_id] = []
        self.active_connections[student_id].append(websocket)
        print(f"Manager: {student_id} conectado.")

    def disconnect(self, student_id: str, websocket: WebSocket):
        # 1. Quitar de conexiones activas
        if student_id in self.active_connections:
            if websocket in self.active_connections[student_id]:
                self.active_connections[student_id].remove(websocket)
            if not self.active_connections[student_id]:
                del self.active_connections[student_id]
        
        print(f"Manager: {student_id} desconectado.")

    async def subscribe(self, student_id: str, topic: str):
        """
        El estudiante dice: 'Quiero escuchar sobre route-123'
        """
        if topic not in self.subscriptions:
            self.subscriptions[topic] = set()
        self.subscriptions[topic].add(student_id)
        print(f"📢 Manager: {student_id} se suscribió a {topic}")

    async def unsubscribe(self, student_id: str, topic: str):
        if topic in self.subscriptions:
            self.subscriptions[topic].discard(student_id)

    async def broadcast_to_topic(self, topic: str, message: dict):
        """
        Envía mensaje a TODOS los estudiantes suscritos a un tópico (Ruta/Bus)
        """
        if topic not in self.subscriptions:
            return # Nadie escucha este canal

        # Obtenemos los IDs suscritos
        subscribers = self.subscriptions[topic]
        
        for student_id in subscribers:
            await self.send_to_student(student_id, message)

    async def send_to_student(self, student_id: str, message: dict):
        """
        Envío directo (Unicast)
        """
        if student_id in self.active_connections:
            for connection in self.active_connections[student_id][:]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"⚠️ Error enviando a {student_id}: {e}")

manager = ConnectionManager()