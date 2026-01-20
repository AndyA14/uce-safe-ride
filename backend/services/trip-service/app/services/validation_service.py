import httpx
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from app.core.config import settings
from app.core.exceptions import ExternalServiceException, ValidationException

logger = logging.getLogger(__name__)


class ValidationService:

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
        token: Optional[str] = None,
        method: str = "GET",
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        headers = kwargs.pop("headers", {})
        if token:
            headers["Authorization"] = f"Bearer {token}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    **kwargs
                )

                if response.status_code == 200:
                    return response.json()

                if response.status_code == 404:
                    logger.warning(
                        f"{service_name}: recurso no encontrado ({url})"
                    )
                    return None

                if response.status_code == 403:
                    raise ValidationException(
                        f"Acceso denegado por {service_name}"
                    )

                logger.error(
                    f"{service_name}: HTTP {response.status_code} ({url})"
                )
                raise ExternalServiceException(
                    service_name,
                    f"HTTP {response.status_code}"
                )

        except httpx.TimeoutException:
            logger.error(f"{service_name}: timeout conectando a {url}")
            raise ExternalServiceException(
                service_name,
                f"Timeout después de {self.timeout}s"
            )

        except httpx.RequestError as e:
            logger.error(f"{service_name}: error de conexión → {e}")
            raise ExternalServiceException(
                service_name,
                "Error de conexión"
            )

    async def get_driver_details(
        self,
        driver_id: str,
        token: Optional[str] = None
    ) -> Dict[str, Any]:
        url = f"{self.driver_service_url}/api/v1/drivers/{driver_id}"
        
        driver = await self._make_request(url, "Driver Service", token)
        
        if not driver:
            raise ValidationException(
                f"El conductor {driver_id} no existe en Driver Service"
            )
        
        logger.info(
            f"Driver {driver_id} obtenido: auth_user_id={driver.get('auth_user_id')}"
        )
        
        return driver

    # ==========================================================
    # Route Validation
    # ==========================================================

    async def validate_route_exists(
        self,
        route_id: str,
        token: Optional[str] = None
    ) -> None:
        url = f"{self.route_service_url}/api/v1/routes/{route_id}"
        route = await self._make_request(url, "Route Service", token)

        if not route:
            raise ValidationException(f"La ruta {route_id} no existe")

        if route.get("is_active") is False:
            raise ValidationException(f"La ruta {route_id} está inactiva")

        logger.info(f"Ruta {route_id} validada correctamente")

    # ==========================================================
    # Driver Validation
    # ==========================================================

    async def validate_driver_exists(
        self,
        driver_id: str,
        token: Optional[str] = None
    ) -> None:
        """
        Valida que un conductor exista y esté disponible.
        """
        # Reutilizar get_driver_details para evitar duplicación
        driver = await self.get_driver_details(driver_id, token)

        # Validar estado de la cuenta (administrativo)
        if driver.get("is_active") is False:
            raise ValidationException(
                f"La cuenta del conductor {driver_id} está desactivada"
            )

        # VALIDACIÓN CLAVE: Estado operativo
        current_status = driver.get("status", "UNKNOWN")

        if current_status != "AVAILABLE":
            raise ValidationException(
                f"El conductor {driver_id} no está disponible para un nuevo viaje. "
                f"Estado actual: {current_status}"
            )

        # Validar licencia (si aplica)
        if driver.get("license_expiry"):
            expiry_date = datetime.fromisoformat(
                driver["license_expiry"].replace("Z", "+00:00")
            )
            if expiry_date < datetime.now(expiry_date.tzinfo):
                raise ValidationException(
                    f"La licencia del conductor {driver_id} ha expirado"
                )

        logger.info(f"Conductor {driver_id} validado y disponible")

    # ==========================================================
    # Vehicle Validation
    # ==========================================================

    async def validate_vehicle_exists(
        self,
        vehicle_id: str,
        token: Optional[str] = None
    ) -> None:
        url = f"{self.vehicle_service_url}/api/v1/vehicles/{vehicle_id}"
        vehicle = await self._make_request(url, "Vehicle Service", token)

        if not vehicle:
            raise ValidationException(f"El vehículo {vehicle_id} no existe")

        status = vehicle.get("status", "").lower()
        if status not in {"available", "active"}:
            raise ValidationException(
                f"Vehículo {vehicle_id} no disponible (estado: {status})"
            )

        logger.info(f"Vehículo {vehicle_id} validado correctamente")

    # ==========================================================
    # Student Validation
    # ==========================================================

    async def validate_student_exists(
        self,
        student_id: str,
        token: Optional[str] = None
    ) -> None:
        url = f"{self.student_service_url}/api/v1/students/{student_id}"
        student = await self._make_request(url, "Student Service", token)

        if not student:
            raise ValidationException(f"El estudiante {student_id} no existe")

        if not student.get("is_active", False):
            raise ValidationException(
                f"El estudiante {student_id} no está activo"
            )

        logger.info(f"Estudiante {student_id} validado correctamente")

    async def get_student_details(
        self,
        student_id: str,
        token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Obtiene detalles completos de un estudiante.
        
        Similar a get_driver_details, retorna:
        - id: UUID del perfil de estudiante
        - auth_user_id: UUID del usuario en Auth Service
        - is_active: bool
        
        Args:
            student_id: UUID del perfil de estudiante
            token: Token JWT para autenticación
        
        Returns:
            Dict completo del estudiante
        
        Raises:
            ValidationException si el estudiante no existe
        """
        url = f"{self.student_service_url}/api/v1/students/{student_id}"
        
        student = await self._make_request(url, "Student Service", token)
        
        if not student:
            raise ValidationException(
                f"El estudiante {student_id} no existe en Student Service"
            )
        
        logger.info(
            f"Student {student_id} obtenido: auth_user_id={student.get('auth_user_id')}"
        )
        
        return student

    # ==========================================================
    # Stop Validation
    # ==========================================================

    async def validate_stop_exists(
        self,
        stop_id: str,
        route_id: Optional[str] = None,
        token: Optional[str] = None
    ) -> None:
        url = f"{self.stop_service_url}/api/v1/stops/{stop_id}"
        stop = await self._make_request(url, "Stop Service", token)

        if not stop:
            raise ValidationException(f"La parada {stop_id} no existe")

        if route_id and stop.get("route_id") != route_id:
            raise ValidationException(
                f"La parada {stop_id} no pertenece a la ruta {route_id}"
            )

        logger.info(f"Parada {stop_id} validada correctamente")

    # ==========================================================
    # Trip Creation Validation (Batch)
    # ==========================================================

    async def validate_trip_creation(
        self,
        route_id: str,
        driver_id: str,
        vehicle_id: str,
        token: Optional[str] = None
    ) -> None:
        """
        Valida todos los requisitos para crear un viaje.
        Ejecuta validaciones en secuencia.
        """
        logger.info(
            "Validando creación de viaje "
            f"(route={route_id}, driver={driver_id}, vehicle={vehicle_id})"
        )

        await self.validate_route_exists(route_id, token)
        await self.validate_driver_exists(driver_id, token)
        await self.validate_vehicle_exists(vehicle_id, token)

        logger.info("Validación de creación de viaje exitosa")