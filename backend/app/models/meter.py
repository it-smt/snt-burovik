# app/models/meter.py

from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, Date, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import TYPE_CHECKING, Optional
from datetime import datetime, date
import enum

from app.database import Base

if TYPE_CHECKING:
    from app.models.plot import Plot


class MeterType(str, enum.Enum):
    ELECTRICITY = "electricity"
    WATER_COLD = "water_cold"
    WATER_HOT = "water_hot"


class MeterReading(Base):
    __tablename__ = "meter_readings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    plot_id: Mapped[int] = mapped_column(ForeignKey("plots.id"), nullable=False)
    meter_type: Mapped[MeterType] = mapped_column(SQLEnum(MeterType), nullable=False)
    value: Mapped[int] = mapped_column(Integer, nullable=False)
    reading_date: Mapped[date] = mapped_column(Date, nullable=False)
    submitted_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    plot: Mapped["Plot"] = relationship("Plot", back_populates="meter_readings")
