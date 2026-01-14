from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional
from enum import Enum

# Ejemplo de un schema para autenticación (para el Auth Service)
class AuthToken(BaseModel):
    access_token: str
    token_type: str

# Schema para el perfil del estudiante (recibido de Student Service)
class StudentProfile(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    email: EmailStr
    enrolled_date: str  # Date as a string for simplicity

    class Config:
        orm_mode = True

# Schema para el perfil del conductor (recibido de Driver Service)
class DriverProfile(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    email: EmailStr
    license_number: str
    phone: Optional[str]
    status: str  # Assuming status is a string enum value like "AVAILABLE", "ON_ROUTE", etc.

    class Config:
        orm_mode = True

# Definición para la estructura de la solicitud de login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Respuesta para un perfil de usuario genérico (puede aplicarse a estudiante, conductor, etc.)
class UserProfileResponse(BaseModel):
    user_id: UUID
    name: str
    email: EmailStr
    role: str  # Asumiendo que tienes roles como "student", "driver", etc.
    profile_type: str  # Tipo de perfil como "student" o "driver"

    class Config:
        orm_mode = True
