from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel



class ProfileOut(BaseModel):
    user_id: UUID
    email: str
    full_name: Optional[str]
    phone: Optional[str]


class ProfileUpdateIn(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class FavouriteIn(BaseModel):
    route_id: UUID
    alias: Optional[str] = None


class FavouriteOut(BaseModel):
    route_id: UUID
    alias: Optional[str]


class RouteUsageOut(BaseModel):
    route_id: UUID
    usage_count: int
    last_used_at: Optional[datetime]



class LatLng(BaseModel):
    lat: float
    lng: float


class StudentCustomRouteCreateIn(BaseModel):
    name: str
    origin: LatLng
    destination: LatLng


class StudentCustomRouteUpdateIn(BaseModel):
    name: Optional[str] = None
    origin: Optional[LatLng] = None
    destination: Optional[LatLng] = None
    active: Optional[bool] = None


class StudentCustomRouteOut(BaseModel):
    id: UUID
    name: str
    origin: LatLng
    destination: LatLng
    polyline: Optional[str]
    active: bool
