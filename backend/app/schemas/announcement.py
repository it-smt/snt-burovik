# app/schemas/announcement.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class AnnouncementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    is_important: bool = False
    expires_at: Optional[date] = None


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    is_important: bool
    author_id: int
    published_at: datetime
    expires_at: Optional[date]

    class Config:
        from_attributes = True
