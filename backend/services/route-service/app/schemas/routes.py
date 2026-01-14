from uuid import UUID
from pydantic import BaseModel


class RouteBase(BaseModel):
    name: str
    origin: str
    destination: str
    polyline: str | None = None


class RouteCreateIn(RouteBase):
    pass


class RouteUpdateIn(BaseModel):
    name: str | None = None
    polyline: str | None = None
    active: bool | None = None


class RouteOut(RouteBase):
    id: UUID
    active: bool

    class Config:
        from_attributes = True
