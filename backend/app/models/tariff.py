# app/models/tariff.py

from sqlalchemy import String, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, TYPE_CHECKING
from datetime import date
import enum

from app.database import Base

if TYPE_CHECKING:
    from app.models.payment import Charge


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

    # Relationships
    charges: Mapped[list["Charge"]] = relationship("Charge", back_populates="tariff")
