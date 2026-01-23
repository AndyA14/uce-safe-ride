from typing import Dict, Set
from fastapi import WebSocket
import logging
import json

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Mapea trip_id -> Set de WebSockets
        self.trip_connections: Dict[int, Set[WebSocket]] = {}
        # Mapea user_id -> WebSocket (si se necesita mantener las conexiones de usuario)
        self.active_connections: Dict[str, WebSocket] = {}
        # Mapea route_id -> Set de user_ids (Para suscripciones por ruta)
        self.route_subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        """
        Registra el WebSocket para un user_id específico.
        """
        self.active_connections[user_id] = websocket
        logger.info(f"🟢 WebSocket conectado para el usuario {user_id}")

    def disconnect(self, user_id: str):
        """
        Desconecta un usuario.
        """
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"🔴 WebSocket desconectado para el usuario {user_id}")
            
        # Limpiar suscripciones de rutas del usuario
        for route_id, subscribers in list(self.route_subscriptions.items()):
            if user_id in subscribers:
                subscribers.discard(user_id)
                if not subscribers:
                    del self.route_subscriptions[route_id]
        
        logger.info(f"Cliente desconectado: {user_id}")

    async def connect_to_trip(self, trip_id: int, websocket: WebSocket):
        """
        Registra el WebSocket para el trip_id específico.
        """
        if trip_id not in self.trip_connections:
            self.trip_connections[trip_id] = set()

        self.trip_connections[trip_id].add(websocket)
        logger.info(f"🚌 WebSocket conectado al trip {trip_id} | sockets={len(self.trip_connections[trip_id])}")

    def disconnect_from_trip(self, trip_id: int, websocket: WebSocket):
        """
        Desconecta el WebSocket del trip_id específico.
        """
        if trip_id in self.trip_connections and websocket in self.trip_connections[trip_id]:
            self.trip_connections[trip_id].remove(websocket)
            logger.info(f"🔴 WebSocket desconectado del trip {trip_id} | sockets restantes={len(self.trip_connections[trip_id])}")

    async def broadcast_to_trip(self, trip_id: int, message: dict):
        """
        Envía un mensaje a todos los WebSockets conectados al trip_id especificado.
        """
        if trip_id not in self.trip_connections:
            logger.warning(f"⚠️ No hay sockets para trip {trip_id}")
            return

        text = json.dumps(message)

        for ws in list(self.trip_connections[trip_id]):
            try:
                await ws.send_text(text)
            except Exception:
                # Si ocurre un error, eliminamos el socket de la lista
                self.trip_connections[trip_id].discard(ws)

    async def broadcast_tracking_event(self, message: dict):
        """
        Envia el evento de seguimiento a todos los clientes conectados.
        """
        text_message = json.dumps(message)
        
        for user_id, connection in list(self.active_connections.items()):
            try:
                await connection.send_text(text_message)
            except Exception as e:
                logger.error(f"Error enviando a {user_id}: {e}")

    async def subscribe(self, user_id: str, route_id: str):
        """
        Registra un usuario para recibir actualizaciones de una ruta.
        """
        if route_id not in self.route_subscriptions:
            self.route_subscriptions[route_id] = set()
        self.route_subscriptions[route_id].add(user_id)
        logger.info(f"📡 Usuario {user_id} suscrito a ruta {route_id}")

    # ✅ NUEVO: La función que faltaba
    async def broadcast(self, message: dict):
        """
        Envía el mensaje a TODOS los usuarios conectados.
        (Estrategia 'Martillo' para asegurar que llegue el tracking)
        """
        # Creamos una copia de la lista para evitar errores si alguien se desconecta durante el loop
        active_users = list(self.active_connections.keys())
        
        if not active_users:
            return # Nadie conectado, no hacemos nada

        for user_id in active_users:
            connection = self.active_connections.get(user_id)
            if connection:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    # Si falla (socket cerrado), lo sacamos de la lista silenciosamente
                    logger.warning(f"Error broadcast a {user_id}: {e}")
                    self.disconnect(user_id)

    # ✅ Método para broadcast específico de rutas
    async def broadcast_to_route(self, route_id: str, message: dict):
        """
        Envía el mensaje a TODOS los usuarios suscritos a la ruta especificada.
        """
        if route_id not in self.route_subscriptions:
            logger.warning(f"⚠️ No hay suscriptores para la ruta {route_id}")
            return
        
        users = self.route_subscriptions[route_id]
        for user_id in users:
            connection = self.active_connections.get(user_id)
            if connection:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"Error enviando a {user_id} en ruta {route_id}: {e}")
                    self.disconnect(user_id)

# Instanciamos el ConnectionManager
manager = ConnectionManager()
