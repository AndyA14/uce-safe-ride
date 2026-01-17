from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, student_id: str, websocket: WebSocket):
        self.active_connections.setdefault(student_id, []).append(websocket)

    def disconnect(self, student_id: str, websocket: WebSocket):
        self.active_connections[student_id].remove(websocket)

    async def send_to_student(self, student_id: str, message: dict):
        if student_id in self.active_connections:
            for ws in self.active_connections[student_id]:
                await ws.send_json(message)
                
manager = ConnectionManager()
