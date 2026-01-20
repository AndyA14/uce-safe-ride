from typing import Dict, Set
from fastapi import WebSocket
import json

from app.core.redis import redis_client


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.route_subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        self.active_connections[user_id] = websocket
        print(f"✅ Manager: Conexión registrada para usuario {user_id}")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        # Limpieza de suscripciones
        for route_id, subscribers in list(self.route_subscriptions.items()):
            if user_id in subscribers:
                subscribers.remove(user_id)
                if not subscribers:
                    del self.route_subscriptions[route_id]

        print(f"❌ Manager: Usuario {user_id} desconectado")

    async def subscribe(self, user_id: str, route_id: str):
        if route_id not in self.route_subscriptions:
            self.route_subscriptions[route_id] = set()
        self.route_subscriptions[route_id].add(user_id)
        print(f"📡 Usuario {user_id} suscrito a ruta {route_id}")

    async def unsubscribe(self, user_id: str, route_id: str):
        if route_id in self.route_subscriptions:
            self.route_subscriptions[route_id].discard(user_id)
            if not self.route_subscriptions[route_id]:
                del self.route_subscriptions[route_id]
            print(f"📴 Usuario {user_id} desuscrito de ruta {route_id}")

    async def send_personal_message(self, user_id: str, message: dict):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_json(message)

    async def broadcast_to_route(self, route_id: str, message: dict):
        user_ids = self.route_subscriptions.get(route_id, set()).copy()

        for user_id in user_ids:
            websocket = self.active_connections.get(user_id)
            if websocket:
                try:
                    await websocket.send_json(message)
                except Exception:
                    self.disconnect(user_id)

    async def publish(self, route_id: str, message: dict):
        await redis_client.publish(
            f"route:{route_id}",
            json.dumps(message)
        )
manager = ConnectionManager()
