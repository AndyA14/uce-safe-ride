from pydantic import BaseModel, Field
from typing import Literal
from uuid import UUID

Direction = Literal["OUTBOUND", "INBOUND"]

class RouteCreateIn(BaseModel):
    name: str = Field(min_length=3, max_length=200)
    direction: Direction
    active: bool = True

class RouteUpdateIn(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=200)
    direction: Direction | None = None
    active: bool | None = None

class RouteOut(BaseModel):
    id: UUID               
    name: str
    direction: Direction
    active: bool

    class Config:
        from_attributes = True
