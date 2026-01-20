from typing import Dict, List, Set
from fastapi import WebSocket
import logging
import json

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Mapea user_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # Mapea route_id -> Set de user_ids (Para filtrado por rutas)
        self.route_subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        # ❌ BORRADO: await websocket.accept() 
        # (Ya se aceptó en main.py, así que solo guardamos la referencia)
        self.active_connections[user_id] = websocket
        logger.info(f"Cliente conectado: {user_id} | Total: {len(self.active_connections)}")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            
        # Limpiar suscripciones del usuario
        for route_id, subscribers in list(self.route_subscriptions.items()):
            if user_id in subscribers:
                subscribers.discard(user_id)
                if not subscribers:
                    del self.route_subscriptions[route_id]
        
        logger.info(f"Cliente desconectado: {user_id}")

    async def broadcast_tracking_event(self, message: dict):
        text_message = json.dumps(message)
        
        for user_id, connection in list(self.active_connections.items()):
            try:
                await connection.send_text(text_message)
            except Exception as e:
                logger.error(f"Error enviando a {user_id}: {e}")

    async def broadcast_to_route(self, route_id: str, message: dict):
        if route_id not in self.route_subscriptions:
            # Opcional: Si nadie escucha esa ruta, ¿enviar a todos? 
            # Por ahora lo dejamos silencioso o podrías llamar a broadcast_tracking_event(message)
            return

        text_message = json.dumps(message)
        subscribers = self.route_subscriptions[route_id]
        
        for user_id in list(subscribers):
            if user_id in self.active_connections:
                try:
                    await self.active_connections[user_id].send_text(text_message)
                except Exception as e:
                    logger.error(f"Error enviando a ruta {route_id}: {e}")

    async def subscribe(self, user_id: str, route_id: str):
        if route_id not in self.route_subscriptions:
            self.route_subscriptions[route_id] = set()
        self.route_subscriptions[route_id].add(user_id)
        logger.info(f"📡 Usuario {user_id} suscrito a ruta {route_id}")

manager = ConnectionManager()