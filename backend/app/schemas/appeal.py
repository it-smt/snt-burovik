# app/schemas/appeal.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.appeal import AppealStatus


class AppealBase(BaseModel):
    plot_id: int
    subject: str = Field(..., min_length=5, max_length=255)
    message: str = Field(..., min_length=10)


class AppealCreate(AppealBase):
    pass


class AppealRespond(BaseModel):
    response: str = Field(..., min_length=1)
    status: AppealStatus


class AppealResponse(BaseModel):
    id: int
    plot_id: int
    subject: str
    message: str
    status: AppealStatus
    response: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True
