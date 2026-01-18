from typing import Dict, List
from fastapi import WebSocket
import json

from app.core.redis import redis_client


class ConnectionManager:
    def __init__(self):
        self.routes: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket, route_id: str):
        if route_id not in self.routes:
            self.routes[route_id] = []
        self.routes[route_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        for route_id, connections in list(self.routes.items()):
            if websocket in connections:
                connections.remove(websocket)
                if not connections:
                    del self.routes[route_id]
                break

    async def send_to_route(self, route_id: str, message: dict):
        connections = self.routes.get(route_id, []).copy()

        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(None, ws)

    async def publish(self, route_id: str, message: dict):
        await redis_client.publish(
            f"route:{route_id}",
            json.dumps(message)
        )


manager = ConnectionManager()
