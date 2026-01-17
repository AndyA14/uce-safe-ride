from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import Optional, List, Annotated, Any

PyObjectId = Annotated[str, BeforeValidator(str)]

class NotificationBase(BaseModel):
    title: str
    message: str
    recipient_id: str
    read: bool = False

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "65a1234567890abcdef12345",
                "title": "El bus está cerca",
                "message": "Tu bus llegará en 5 minutos",
                "recipient_id": "user123",
                "read": False
            }
        }
    )
NotificationResponse = Notification