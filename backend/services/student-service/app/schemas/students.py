from datetime import datetime
from pydantic import BaseModel

class ProfileOut(BaseModel):
    user_id: str
    email: str
    full_name: str | None
    phone: str | None

class ProfileUpdateIn(BaseModel):
    full_name: str | None = None
    phone: str | None = None

class FavouriteIn(BaseModel):
    route_id: str
    alias: str | None = None

class FavouriteOut(BaseModel):
    route_id: str
    alias: str | None

class RouteUsageOut(BaseModel):
    route_id: str
    usage_count: int
    last_used_at: datetime | None