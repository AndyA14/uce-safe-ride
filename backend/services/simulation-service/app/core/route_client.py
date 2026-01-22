import requests
import polyline  # pip install polyline
import logging
from typing import List, Tuple, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class RouteClient:
    """
    Cliente para obtener rutas desde Route Service y convertirlas
    en puntos (lat, lng) que el simulador pueda recorrer.
    """

    def __init__(self):
        self.route_service_url = settings.ROUTE_SERVICE_URL
        self.timeout = 10

    def get_route_points(self, route_id: str) -> List[Tuple[float, float]]:
        """
        Obtiene los puntos reales de una ruta.

        Flujo:
        1. Consulta Route Service (Fuente de la Verdad)
        2. Decodifica la polyline si existe
        3. Fallback: línea recta interpolada
        """
        logger.info(f"🗺️ Obteniendo puntos de ruta: {route_id}")

        route_data = self._fetch_route_data(route_id)

        # ✅ PRODUCCIÓN: Decodificar polyline real
        if route_data.get("polyline"):
            points = self._decode_polyline(route_data["polyline"])
            logger.info(f"✅ Ruta decodificada: {len(points)} puntos")
            return points

        # ⚠️ Fallback legacy
        logger.warning(
            f"⚠️ Ruta {route_id} sin polyline, usando fallback"
        )
        return self._generate_fallback_points(route_data)

    # ======================================================
    # INTERNOS
    # ======================================================

    def _fetch_route_data(self, route_id: str) -> Dict[str, Any]:
        """
        Consulta Route Service por una ruta específica.
        """
        url = f"{self.route_service_url}/api/v1/routes/{route_id}"
        logger.info(f"🌐 Consultando Route Service: {url}")

        response = requests.get(url, timeout=self.timeout)
        response.raise_for_status()

        data = response.json()

        logger.info(
            f"📦 Ruta recibida: {data.get('name', 'Unknown')} | "
            f"Polyline: {'Sí' if data.get('polyline') else 'No'}"
        )
        return data

    def _decode_polyline(self, encoded_polyline: str) -> List[Tuple[float, float]]:
        """
        Decodifica una polyline de Google Maps a [(lat, lng), ...]
        """
        try:
            points = polyline.decode(encoded_polyline)

            if not points:
                raise ValueError("Polyline decodificado vacío")

            return points

        except Exception as e:
            logger.error(f"❌ Error decodificando polyline: {e}")
            raise

    def _generate_fallback_points(
        self, route_data: Dict[str, Any]
    ) -> List[Tuple[float, float]]:
        """
        Genera una línea recta si la ruta no tiene polyline.
        """
        origin = route_data.get("origin", {})
        destination = route_data.get("destination", {})

        start = (
            origin.get("lat") or origin.get("latitude"),
            origin.get("lng") or origin.get("longitude"),
        )
        end = (
            destination.get("lat") or destination.get("latitude"),
            destination.get("lng") or destination.get("longitude"),
        )

        if None in start or None in end:
            raise ValueError("Origin/Destination inválidos para fallback")

        return self._interpolate_points(
            start,
            end,
            settings.FALLBACK_POINTS_COUNT,
        )

    def _interpolate_points(
        self,
        start: Tuple[float, float],
        end: Tuple[float, float],
        num_points: int,
    ) -> List[Tuple[float, float]]:
        """
        Interpola puntos entre dos coordenadas.
        """
        points: List[Tuple[float, float]] = []

        for i in range(num_points + 1):
            ratio = i / num_points
            lat = start[0] + (end[0] - start[0]) * ratio
            lng = start[1] + (end[1] - start[1]) * ratio
            points.append((lat, lng))

        return points
