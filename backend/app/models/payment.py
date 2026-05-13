# app/models/payment.py

from sqlalchemy import String, Numeric, ForeignKey, DateTime, Date, Enum as SQLEnum, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import TYPE_CHECKING, Optional
from datetime import datetime, date
import enum

from app.database import Base

if TYPE_CHECKING:
    from app.models.plot import Plot
    from app.models.tariff import Tariff


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    QR = "qr"


# Промежуточная таблица для связи многие-ко-многим
payment_allocation = Table(
    "payment_allocations",
    Base.metadata,
    Column("id", primary_key=True),
    Column("payment_id", ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, index=True),
    Column("charge_id", ForeignKey("charges.id", ondelete="CASCADE"), nullable=False, index=True),
    Column("amount", Numeric(10, 2), nullable=False),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
)


class Charge(Base):
    __tablename__ = "charges"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    plot_id: Mapped[int] = mapped_column(ForeignKey("plots.id"), nullable=False)
    tariff_id: Mapped[int] = mapped_column(ForeignKey("tariffs.id"), nullable=False)
    period: Mapped[str] = mapped_column(String(7), nullable=False)  # "2025-01"
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    plot: Mapped["Plot"] = relationship("Plot", back_populates="charges")
    tariff: Mapped["Tariff"] = relationship("Tariff")
    # Связь с оплатами через промежуточную таблицу
    allocations: Mapped[list["PaymentAllocation"]] = relationship(
        "PaymentAllocation", back_populates="charge", cascade="all, delete-orphan"
    )

    @property
    def paid_amount(self) -> float:
        """Сумма, уже оплаченная по этому начислению"""
        return sum(alloc.amount for alloc in self.allocations)

    @property
    def remaining_amount(self) -> float:
        """Остаток к оплате"""
        return self.amount - self.paid_amount

    @property
    def is_fully_paid(self) -> bool:
        """Полностью ли оплачено"""
        return self.paid_amount >= self.amount


class PaymentAllocation(Base):
    """Распределение оплаты по начислениям"""
    __tablename__ = "payment_allocations_detail"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    payment_id: Mapped[int] = mapped_column(ForeignKey("payments.id", ondelete="CASCADE"), nullable=False)
    charge_id: Mapped[int] = mapped_column(ForeignKey("charges.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    payment: Mapped["Payment"] = relationship("Payment", back_populates="allocations")
    charge: Mapped["Charge"] = relationship("Charge", back_populates="allocations")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    plot_id: Mapped[int] = mapped_column(ForeignKey("plots.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(SQLEnum(PaymentMethod), nullable=False)
    receipt_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    recorded_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    plot: Mapped["Plot"] = relationship("Plot", back_populates="payments")
    # Распределения этой оплаты
    allocations: Mapped[list["PaymentAllocation"]] = relationship(
        "PaymentAllocation", back_populates="payment", cascade="all, delete-orphan"
    )

    @property
    def allocated_amount(self) -> float:
        """Сумма, уже распределённая по начислениям"""
        return sum(alloc.amount for alloc in self.allocations)

    @property
    def unallocated_amount(self) -> float:
        """Не распределённый остаток оплаты"""
        return self.amount - self.allocated_amount
