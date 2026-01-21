from fastapi import WebSocket
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Mapea trip_id -> Lista de WebSockets (Estudiantes escuchando ese viaje)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, trip_id: int):
        if trip_id not in self.active_connections:
            self.active_connections[trip_id] = []
        self.active_connections[trip_id].append(websocket)
        logger.info(f"🔌 Socket agregado al viaje {trip_id}. Total conectados: {len(self.active_connections[trip_id])}")

    def disconnect(self, websocket: WebSocket, trip_id: int):
        if trip_id in self.active_connections:
            if websocket in self.active_connections[trip_id]:
                self.active_connections[trip_id].remove(websocket)
                if not self.active_connections[trip_id]:
                    del self.active_connections[trip_id]

    async def broadcast_location(self, trip_id: int, data: dict):
        # Esta es la función que llamará el CONDUCTOR REAL
        if trip_id in self.active_connections:
            for connection in self.active_connections[trip_id][:]:
                try:
                    await connection.send_json(data)
                except Exception as e:
                    logger.warning(f"⚠️ Error enviando a cliente: {e}")

# Instancia global que usaremos en toda la app
manager = ConnectionManager()