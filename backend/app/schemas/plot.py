# app/schemas/plot.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse


class PlotBase(BaseModel):
    number: str = Field(..., min_length=1, max_length=50)
    area_sqm: int = Field(..., gt=0)
    cadastral_number: Optional[str] = Field(None, max_length=100)
    address: str = Field(..., min_length=1, max_length=255)
    has_electricity: bool = False
    has_water: bool = False


class PlotCreate(PlotBase):
    owner_id: Optional[int] = None


class PlotUpdate(BaseModel):
    number: Optional[str] = Field(None, min_length=1, max_length=50)
    area_sqm: Optional[int] = Field(None, gt=0)
    cadastral_number: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, min_length=1, max_length=255)
    owner_id: Optional[int] = None
    has_electricity: Optional[bool] = None
    has_water: Optional[bool] = None


class PlotResponse(BaseModel):
    id: int
    number: str
    area_sqm: int
    cadastral_number: Optional[str]
    address: str
    owner_id: Optional[int]
    owner: Optional[UserResponse]
    has_electricity: bool
    has_water: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PlotBalance(BaseModel):
    plot_id: int
    plot_number: str
    owner_name: str
    total_charged: float
    total_paid: float
    balance: float
