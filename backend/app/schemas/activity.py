# app/schemas/activity.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ActivityLogBase(BaseModel):
    action: str = Field(..., description="Действие: create, update, delete, verify, respond")
    entity_type: str = Field(..., description="Тип сущности: user, plot, payment, charge, meter, announcement, appeal")
    entity_id: Optional[int] = Field(None, description="ID сущности")
    entity_name: str = Field(..., description="Название/описание сущности")
    details: Optional[str] = Field(None, description="Детали действия")


class ActivityLogCreate(ActivityLogBase):
    user_id: int


class ActivityLogResponse(ActivityLogBase):
    id: int
    user_id: int
    user_name: str
    created_at: datetime

    class Config:
        from_attributes = True
