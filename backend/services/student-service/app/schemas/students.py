import uuid
from typing import Optional, List
from pydantic import BaseModel, Field


# ------------------------------------------------------------------
# COMMON
# ------------------------------------------------------------------
class LatLng(BaseModel):
    lat: float
    lng: float


# ------------------------------------------------------------------
# PROFILE
# ------------------------------------------------------------------
class ProfileOut(BaseModel):
    id: uuid.UUID
    auth_user_id: uuid.UUID
    email: str
    full_name: Optional[str]
    phone: Optional[str]

    class Config:
        from_attributes = True


class ProfileUpdateIn(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


# ------------------------------------------------------------------
# FAVOURITES
# ------------------------------------------------------------------
class FavouriteIn(BaseModel):
    route_id: uuid.UUID
    alias: Optional[str] = None


class FavouriteOut(BaseModel):
    route_id: uuid.UUID
    alias: Optional[str] = None


# ------------------------------------------------------------------
# ROUTE USAGE
# ------------------------------------------------------------------
class RouteUsageOut(BaseModel):
    route_id: uuid.UUID
    usage_count: int
    last_used_at: Optional[str]


# ------------------------------------------------------------------
# CUSTOM ROUTES
# ------------------------------------------------------------------
class StudentCustomRouteCreateIn(BaseModel):
    name: str
    origin: LatLng
    destination: LatLng
    polyline: Optional[str] = None


class StudentCustomRouteUpdateIn(BaseModel):
    name: Optional[str] = None
    origin: Optional[LatLng] = None
    destination: Optional[LatLng] = None
    active: Optional[bool] = None


class StudentCustomRouteOut(BaseModel):
    id: uuid.UUID
    name: str
    origin: LatLng
    destination: LatLng
    polyline: Optional[str]
    active: bool
