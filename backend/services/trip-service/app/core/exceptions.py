from fastapi import HTTPException, status


class TripServiceException(HTTPException):
    """Excepción base para el Trip Service"""
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class TripNotFoundException(TripServiceException):
    """Excepción cuando un viaje no existe"""
    def __init__(self, trip_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Viaje con ID {trip_id} no encontrado"
        )


class TripAlreadyActiveException(TripServiceException):
    """Excepción cuando el conductor ya tiene un viaje activo"""
    def __init__(self, driver_id: int):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El conductor {driver_id} ya tiene un viaje activo. "
                   f"Debe completar o cancelar el viaje actual antes de crear uno nuevo."
        )


class TripFullException(TripServiceException):
    """Excepción cuando el viaje está lleno"""
    def __init__(self, trip_id: int, max_passengers: int = None):
        detail = f"El viaje {trip_id} está lleno"
        if max_passengers:
            detail += f" (capacidad máxima: {max_passengers})"
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )


class InvalidTripStatusException(TripServiceException):
    """Excepción cuando se intenta una acción en un estado inválido"""
    def __init__(self, current_status: str, action: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede {action} un viaje en estado {current_status}"
        )


class PassengerAlreadyInTripException(TripServiceException):
    """Excepción cuando un estudiante ya está en el viaje"""
    def __init__(self, student_id: int, trip_id: int):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El estudiante {student_id} ya está registrado en el viaje {trip_id}"
        )


class PassengerNotFoundException(TripServiceException):
    """Excepción cuando un pasajero no existe"""
    def __init__(self, passenger_id: int, trip_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pasajero {passenger_id} no encontrado en viaje {trip_id}"
        )


class InvalidPassengerStatusException(TripServiceException):
    """Excepción cuando se intenta una acción con un pasajero en estado inválido"""
    def __init__(self, current_status: str, action: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede {action} un pasajero en estado {current_status}"
        )


class ExternalServiceException(TripServiceException):
    """Excepción cuando un servicio externo falla"""
    def __init__(self, service_name: str, detail: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error comunicándose con {service_name}: {detail}"
        )


class ValidationException(TripServiceException):
    """Excepción para errores de validación de negocio"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )