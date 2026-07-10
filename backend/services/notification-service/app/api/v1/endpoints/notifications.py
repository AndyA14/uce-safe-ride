from fastapi import APIRouter, HTTPException
from db.mongo import notifications_collection
from app.api.v1.schemas.notification import NotificationCreate, NotificationResponse
from bson import ObjectId

router = APIRouter()

@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(notification_id: str):
    notification = notifications_collection.find_one({"_id": ObjectId(notification_id)})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification["id"] = notification["_id"]
    return notification

@router.post("/", response_model=NotificationResponse)
def create_notification(notification: NotificationCreate):
    data = notification.model_dump()
    data["created_at"] = data.get("created_at") or None
    result = notifications_collection.insert_one(data)
    created_notification = notifications_collection.find_one({"_id": result.inserted_id})
    created_notification["id"] = created_notification["_id"]
    return created_notification
