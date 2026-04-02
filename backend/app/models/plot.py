# app/models/plot.py

from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import TYPE_CHECKING, Optional
from datetime import datetime

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.payment import Charge, Payment
    from app.models.meter import MeterReading


class Plot(Base):
    __tablename__ = "plots"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    area_sqm: Mapped[int] = mapped_column(Integer, nullable=False)
    cadastral_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    has_electricity: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_water: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner: Mapped[Optional["User"]] = relationship("User", back_populates="plots")
    charges: Mapped[list["Charge"]] = relationship("Charge", back_populates="plot")
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="plot")
    meter_readings: Mapped[list["MeterReading"]] = relationship("MeterReading", back_populates="plot")
