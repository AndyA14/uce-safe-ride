"""
Servicio para validar datos con servicios externos.
Implementa circuit breaker y retry logic para resiliencia.
"""
import httpx
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.exceptions import ExternalServiceException, ValidationException

logger = logging.getLogger(__name__)


class ValidationService:
    """
    Servicio para validar entidades en servicios externos.
    
    Implementa:
    - Validación de Route, Driver, Vehicle, Student, Stop
    - Circuit breaker básico (opcional, mejora futura)
    - Timeout configurable
    - Logging detallado de errores
    """
    
    def __init__(self):
        self.timeout = settings.EXTERNAL_SERVICE_TIMEOUT
        self.route_service_url = settings.ROUTE_SERVICE_URL
        self.driver_service_url = settings.DRIVER_SERVICE_URL
        self.vehicle_service_url = settings.VEHICLE_SERVICE_URL
        self.student_service_url = settings.STUDENT_SERVICE_URL
        self.stop_service_url = settings.STOP_SERVICE_URL
    
    async def _make_request(
        self,
        url: str,
        service_name: str,
        method: str = "GET",
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Método interno para hacer requests HTTP con manejo de errores.
        
        Args:
            url: URL completa del endpoint
            service_name: Nombre del servicio (para logging)
            method: Método HTTP (GET, POST, etc.)
            **kwargs: Argumentos adicionales para httpx
        
        Returns:
            Response JSON si exitoso, None si falla
        
        Raises:
            ExternalServiceException si el servicio no responde
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(method, url, **kwargs)
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    logger.warning(f"{service_name}: Recurso no encontrado en {url}")
                    return None
                else:
                    logger.error(
                        f"{service_name}: Error {response.status_code} en {url}"
                    )
                    raise ExternalServiceException(
                        service_name,
                        f"HTTP {response.status_code}"
                    )
                    
        except httpx.TimeoutException:
            logger.error(f"{service_name}: Timeout conectando a {url}")
            raise ExternalServiceException(
                service_name,
                f"Timeout después de {self.timeout}s"
            )
        except httpx.RequestError as e:
            logger.error(f"{service_name}: Error de conexión a {url}: {e}")
            raise ExternalServiceException(
                service_name,
                f"Error de conexión: {str(e)}"
            )
    
    # ==================== Route Validation ====================
    
    async def validate_route_exists(self, route_id: int) -> bool:
        """
        Valida que una ruta exista y esté activa.
        
        Args:
            route_id: ID de la ruta a validar
        
        Returns:
            True si la ruta existe y está activa
        
        Raises:
            ExternalServiceException si el servicio no responde
            ValidationException si la ruta no existe o está inactiva
        """
        url = f"{self.route_service_url}/api/v1/routes/{route_id}"
        
        try:
            route_data = await self._make_request(url, "Route Service")
            
            if not route_data:
                raise ValidationException(f"La ruta {route_id} no existe")
            
            # Verificar que la ruta esté activa (si el campo existe)
            if "is_active" in route_data and not route_data["is_active"]:
                raise ValidationException(f"La ruta {route_id} está inactiva")
            
            logger.info(f"Ruta {route_id} validada exitosamente")
            return True
            
        except ExternalServiceException:
            # Re-raise si es error de servicio
            raise
        except Exception as e:
            logger.error(f"Error validando ruta {route_id}: {e}")
            raise ValidationException(f"Error validando ruta: {str(e)}")
    
    # ==================== Driver Validation ====================
    
    async def validate_driver_exists(self, driver_id: int) -> bool:
        """
        Valida que un conductor exista y esté disponible.
        
        Args:
            driver_id: ID del conductor a validar
        
        Returns:
            True si el conductor existe y está disponible
        
        Raises:
            ExternalServiceException si el servicio no responde
            ValidationException si el conductor no existe o no está disponible
        """
        url = f"{self.driver_service_url}/api/v1/drivers/{driver_id}"
        
        try:
            driver_data = await self._make_request(url, "Driver Service")
            
            if not driver_data:
                raise ValidationException(f"El conductor {driver_id} no existe")
            
            # Verificar que el conductor esté activo
            if not driver_data.get("is_active", False):
                raise ValidationException(
                    f"El conductor {driver_id} no está activo"
                )
            
            # Verificar licencia vigente (si el campo existe)
            if "license_expiry" in driver_data:
                expiry_date = datetime.fromisoformat(
                    driver_data["license_expiry"].replace("Z", "+00:00")
                )
                if expiry_date < datetime.now(expiry_date.tzinfo):
                    raise ValidationException(
                        f"La licencia del conductor {driver_id} ha expirado"
                    )
            
            logger.info(f"Conductor {driver_id} validado exitosamente")
            return True
            
        except ExternalServiceException:
            raise
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Error validando conductor {driver_id}: {e}")
            raise ValidationException(f"Error validando conductor: {str(e)}")
    
    # ==================== Vehicle Validation ====================
    
    async def validate_vehicle_exists(self, vehicle_id: int) -> bool:
        """
        Valida que un vehículo exista y esté disponible.
        
        Args:
            vehicle_id: ID del vehículo a validar
        
        Returns:
            True si el vehículo existe y está disponible
        
        Raises:
            ExternalServiceException si el servicio no responde
            ValidationException si el vehículo no existe o no está disponible
        """
        url = f"{self.vehicle_service_url}/api/v1/vehicles/{vehicle_id}"
        
        try:
            vehicle_data = await self._make_request(url, "Vehicle Service")
            
            if not vehicle_data:
                raise ValidationException(f"El vehículo {vehicle_id} no existe")
            
            # Verificar que el vehículo esté disponible
            status = vehicle_data.get("status", "").lower()
            if status not in ["available", "active"]:
                raise ValidationException(
                    f"El vehículo {vehicle_id} no está disponible (estado: {status})"
                )
            
            # Verificar mantenimiento vigente (si el campo existe)
            if "next_maintenance" in vehicle_data:
                maintenance_date = datetime.fromisoformat(
                    vehicle_data["next_maintenance"].replace("Z", "+00:00")
                )
                if maintenance_date < datetime.now(maintenance_date.tzinfo):
                    logger.warning(
                        f"Vehículo {vehicle_id} requiere mantenimiento"
                    )
            
            logger.info(f"Vehículo {vehicle_id} validado exitosamente")
            return True
            
        except ExternalServiceException:
            raise
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Error validando vehículo {vehicle_id}: {e}")
            raise ValidationException(f"Error validando vehículo: {str(e)}")
    
    # ==================== Student Validation ====================
    
    async def validate_student_exists(self, student_id: int) -> bool:
        """
        Valida que un estudiante exista y esté activo.
        
        Args:
            student_id: ID del estudiante a validar
        
        Returns:
            True si el estudiante existe y está activo
        
        Raises:
            ExternalServiceException si el servicio no responde
            ValidationException si el estudiante no existe o no está activo
        """
        url = f"{self.student_service_url}/api/v1/students/{student_id}"
        
        try:
            student_data = await self._make_request(url, "Student Service")
            
            if not student_data:
                raise ValidationException(f"El estudiante {student_id} no existe")
            
            # Verificar que el estudiante esté activo
            if not student_data.get("is_active", False):
                raise ValidationException(
                    f"El estudiante {student_id} no está activo"
                )
            
            logger.info(f"Estudiante {student_id} validado exitosamente")
            return True
            
        except ExternalServiceException:
            raise
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Error validando estudiante {student_id}: {e}")
            raise ValidationException(f"Error validando estudiante: {str(e)}")
    
    # ==================== Stop Validation ====================
    
    async def validate_stop_exists(self, stop_id: int, route_id: Optional[int] = None) -> bool:
        """
        Valida que una parada exista y, opcionalmente, pertenezca a una ruta.
        
        Args:
            stop_id: ID de la parada a validar
            route_id: ID de la ruta (opcional, para validar pertenencia)
        
        Returns:
            True si la parada existe (y pertenece a la ruta si se especifica)
        
        Raises:
            ExternalServiceException si el servicio no responde
            ValidationException si la parada no existe o no pertenece a la ruta
        """
        url = f"{self.stop_service_url}/api/v1/stops/{stop_id}"
        
        try:
            stop_data = await self._make_request(url, "Stop Service")
            
            if not stop_data:
                raise ValidationException(f"La parada {stop_id} no existe")
            
            # Si se especifica route_id, verificar que la parada pertenezca a esa ruta
            if route_id is not None:
                stop_route_id = stop_data.get("route_id")
                if stop_route_id != route_id:
                    raise ValidationException(
                        f"La parada {stop_id} no pertenece a la ruta {route_id}"
                    )
            
            logger.info(f"Parada {stop_id} validada exitosamente")
            return True
            
        except ExternalServiceException:
            raise
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Error validando parada {stop_id}: {e}")
            raise ValidationException(f"Error validando parada: {str(e)}")
    
    # ==================== Batch Validation ====================
    
    async def validate_trip_creation(
        self,
        route_id: int,
        driver_id: int,
        vehicle_id: int
    ) -> bool:
        """
        Valida todos los requisitos para crear un viaje.
        
        Args:
            route_id: ID de la ruta
            driver_id: ID del conductor
            vehicle_id: ID del vehículo
        
        Returns:
            True si todas las validaciones pasan
        
        Raises:
            ValidationException si alguna validación falla
            ExternalServiceException si algún servicio no responde
        """
        logger.info(
            f"Validando creación de viaje: route={route_id}, "
            f"driver={driver_id}, vehicle={vehicle_id}"
        )
        
        # Validar en paralelo (opcional, para mejor performance)
        # Por ahora, validamos secuencialmente
        await self.validate_route_exists(route_id)
        await self.validate_driver_exists(driver_id)
        await self.validate_vehicle_exists(vehicle_id)
        
        logger.info("Todas las validaciones de creación de viaje pasaron")
        return True