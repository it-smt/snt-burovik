# app/models/tariff.py

from sqlalchemy import String, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional
from datetime import date
import enum

from app.database import Base


class TariffType(str, enum.Enum):
    MEMBERSHIP = "membership"
    TARGETED = "targeted"
    ELECTRICITY = "electricity"
    WATER = "water"
    GARBAGE = "garbage"


class Tariff(Base):
    __tablename__ = "tariffs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[TariffType] = mapped_column(SQLEnum(TariffType), nullable=False)
    rate: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
