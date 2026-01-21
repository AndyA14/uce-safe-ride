import requests
import polyline
import logging
from typing import List, Tuple, Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class RouteClient:
    """Cliente para obtener y procesar rutas"""
    
    def __init__(self):
        self.trip_service_url = settings.TRIP_SERVICE_URL
        self.route_service_url = settings.ROUTE_SERVICE_URL
        self.timeout = 10
    
    def get_route_points(self, route_id: str) -> List[Tuple[float, float]]:
        """
        Obtiene la lista de coordenadas (lat, lng) de una ruta.
        
        Proceso:
        1. Obtener datos de la ruta desde Route Service
        2. Si tiene polyline, decodificarlo
        3. Si no, generar línea recta entre origin/destination
        
        Args:
            route_id: UUID de la ruta
        
        Returns:
            Lista de tuplas (latitud, longitud)
        
        Raises:
            Exception si no se puede obtener la ruta
        """
        logger.info(f"Obteniendo puntos de ruta: {route_id}")
        
        try:
            # 1. Obtener información de la ruta
            route_data = self._fetch_route_data(route_id)
            
            # 2. Intentar decodificar polyline
            if route_data.get("polyline"):
                points = self._decode_polyline(route_data["polyline"])
                logger.info(f"✅ Polyline decodificado: {len(points)} puntos")
                return points
            
            # 3. Fallback: Línea recta interpolada
            logger.warning(
                f"⚠️ Ruta {route_id} sin polyline, usando fallback"
            )
            return self._generate_fallback_points(route_data)
            
        except Exception as e:
            logger.error(f"Error obteniendo ruta {route_id}: {e}")
            raise
    
    def _fetch_route_data(self, route_id: str) -> Dict[str, Any]:
        """
        Obtiene datos de la ruta desde Route Service.
        
        Estructura esperada:
        {
            "id": "uuid",
            "name": "Norte",
            "polyline": "encoded_string_from_google",
            "origin": {"lat": -0.18, "lng": -78.46},
            "destination": {"lat": -0.20, "lng": -78.48}
        }
        """
        url = f"{self.route_service_url}/api/v1/routes/{route_id}"
        
        logger.info(f"Consultando Route Service: {url}")
        
        response = requests.get(url, timeout=self.timeout)
        response.raise_for_status()
        
        route_data = response.json()
        logger.info(
            f"Ruta obtenida: {route_data.get('name', 'Unknown')} "
            f"(polyline: {'Sí' if route_data.get('polyline') else 'No'})"
        )
        
        return route_data
    
    def _decode_polyline(self, encoded_polyline: str) -> List[Tuple[float, float]]:
        """
        Decodifica un polyline de Google Maps.
        
        Args:
            encoded_polyline: String codificado (ej: "_p~iF~ps|U_ulL...")
        
        Returns:
            Lista de (lat, lng) tuplas
        
        Example:
            >>> decode_polyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@")
            [(38.5, -120.2), (40.7, -120.95), (43.252, -126.453)]
        """
        try:
            # polyline.decode retorna lista de (lat, lng)
            points = polyline.decode(encoded_polyline)
            
            if not points:
                raise ValueError("Polyline decodificado está vacío")
            
            logger.info(
                f"Polyline decodificado exitosamente: {len(points)} puntos"
            )
            
            return points
            
        except Exception as e:
            logger.error(f"Error decodificando polyline: {e}")
            raise ValueError(f"Polyline inválido: {e}")
    
    def _generate_fallback_points(
        self, 
        route_data: Dict[str, Any]
    ) -> List[Tuple[float, float]]:
        """
        Genera una línea recta interpolada entre origen y destino.
        
        Para rutas legacy sin polyline.
        
        Args:
            route_data: Diccionario con origin y destination
        
        Returns:
            Lista de puntos interpolados
        """
        try:
            # Extraer coordenadas
            origin = route_data.get("origin", {})
            destination = route_data.get("destination", {})
            
            origin_lat = origin.get("lat") or origin.get("latitude")
            origin_lng = origin.get("lng") or origin.get("longitude")
            
            dest_lat = destination.get("lat") or destination.get("latitude")
            dest_lng = destination.get("lng") or destination.get("longitude")
            
            if not all([origin_lat, origin_lng, dest_lat, dest_lng]):
                raise ValueError(
                    "Ruta no tiene origin/destination válidos"
                )
            
            # Interpolar puntos
            points = self._interpolate_points(
                (origin_lat, origin_lng),
                (dest_lat, dest_lng),
                settings.FALLBACK_POINTS_COUNT
            )
            
            logger.info(
                f"📍 Fallback generado: {len(points)} puntos "
                f"desde ({origin_lat}, {origin_lng}) "
                f"hasta ({dest_lat}, {dest_lng})"
            )
            
            return points
            
        except Exception as e:
            logger.error(f"Error generando fallback: {e}")
            raise
    
    def _interpolate_points(
        self,
        start: Tuple[float, float],
        end: Tuple[float, float],
        num_points: int
    ) -> List[Tuple[float, float]]:
        """
        Interpola puntos entre dos coordenadas.
        
        Args:
            start: (lat, lng) inicial
            end: (lat, lng) final
            num_points: Número de puntos intermedios
        
        Returns:
            Lista de puntos interpolados
        """
        points = []
        
        for i in range(num_points + 1):
            ratio = i / num_points
            
            lat = start[0] + (end[0] - start[0]) * ratio
            lng = start[1] + (end[1] - start[1]) * ratio
            
            points.append((lat, lng))
        
        return points

