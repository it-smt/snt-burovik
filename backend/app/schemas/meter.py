# app/schemas/meter.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from app.models.meter import MeterType


class MeterReadingBase(BaseModel):
    plot_id: int
    meter_type: MeterType
    value: int = Field(..., ge=0)
    reading_date: date
    photo_url: Optional[str] = None


class MeterReadingCreate(MeterReadingBase):
    pass


class MeterReadingResponse(BaseModel):
    id: int
    plot_id: int
    meter_type: MeterType
    value: int
    reading_date: date
    submitted_by: int
    photo_url: Optional[str]
    is_verified: bool
    verified_by: Optional[int]
    verified_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
