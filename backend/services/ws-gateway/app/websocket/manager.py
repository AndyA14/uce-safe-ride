from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, student_id: str, websocket: WebSocket):
        """
        Registra una nueva conexión asociada a un estudiante.
        """
        if student_id not in self.active_connections:
            self.active_connections[student_id] = []
        
        self.active_connections[student_id].append(websocket)
        print(f"🔌 Manager: Cliente registrado {student_id} (Total: {len(self.active_connections[student_id])})")

    def disconnect(self, student_id: str, websocket: WebSocket):
        if student_id in self.active_connections:
            if websocket in self.active_connections[student_id]:
                self.active_connections[student_id].remove(websocket)
            
            # Si ya no tiene conexiones activas, borramos la entrada del diccionario
            if not self.active_connections[student_id]:
                del self.active_connections[student_id]
                
        print(f"🔌 Manager: Cliente desconectado {student_id}")

    async def send_to_student(self, student_id: str, message: dict):
        if student_id in self.active_connections:
            for connection in self.active_connections[student_id][:]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"⚠️ Error enviando a {student_id}: {e}")
                    # Opcional: Podrías limpiar la conexión muerta aquí
        else:
            print(f"⚠️ No se pudo enviar mensaje: Estudiante {student_id} no está conectado.")

manager = ConnectionManager()