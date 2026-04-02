# app/schemas/tariff.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from app.models.tariff import TariffType


class TariffBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: TariffType
    rate: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=50)
    effective_from: date


class TariffCreate(TariffBase):
    pass


class TariffUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[TariffType] = None
    rate: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None


class TariffResponse(BaseModel):
    id: int
    name: str
    type: TariffType
    rate: float
    unit: str
    effective_from: date
    effective_to: Optional[date]

    class Config:
        from_attributes = True
