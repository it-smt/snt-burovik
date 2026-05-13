# app/schemas/payment.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.models.payment import PaymentMethod


class ChargeBase(BaseModel):
    plot_id: int
    tariff_id: int
    period: str = Field(..., pattern=r"^\d{4}-\d{2}$")
    amount: float = Field(..., gt=0)
    description: Optional[str] = None


class ChargeCreate(ChargeBase):
    pass


class ChargeAllocationResponse(BaseModel):
    """Распределение оплаты по начислению"""
    id: int
    payment_id: int
    charge_id: int
    amount: float
    created_at: datetime

    class Config:
        from_attributes = True


class ChargeResponse(BaseModel):
    id: int
    plot_id: int
    tariff_id: int
    period: str
    amount: float
    description: Optional[str]
    created_at: datetime
    # Информация об оплате
    paid_amount: float = 0.0
    remaining_amount: float = 0.0
    is_fully_paid: bool = False
    allocations: List[ChargeAllocationResponse] = []

    class Config:
        from_attributes = True


class MassChargeCreate(BaseModel):
    tariff_id: int
    period: str = Field(..., pattern=r"^\d{4}-\d{2}$")
    description: Optional[str] = None
    plot_ids: List[int] = []  # Пустой = все с владельцем
    amount_per_plot: Optional[float] = None


class MassChargeResult(BaseModel):
    created_count: int
    total_amount: float
    skipped_count: int


class PaymentAllocationCreate(BaseModel):
    """Создание распределения оплаты"""
    charge_id: int
    amount: float = Field(..., gt=0)


class PaymentAllocationResponse(BaseModel):
    """Распределение оплаты"""
    id: int
    payment_id: int
    charge_id: int
    amount: float
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    plot_id: int
    amount: float = Field(..., gt=0)
    payment_date: date
    payment_method: PaymentMethod
    receipt_number: Optional[str] = None
    description: Optional[str] = None


class PaymentCreate(PaymentBase):
    allocations: List[PaymentAllocationCreate] = []


class PaymentResponse(BaseModel):
    id: int
    plot_id: int
    amount: float
    payment_date: date
    payment_method: PaymentMethod
    receipt_number: Optional[str]
    description: Optional[str]
    recorded_by: int
    created_at: datetime
    # Информация о распределении
    allocated_amount: float = 0.0
    unallocated_amount: float = 0.0
    allocations: List[PaymentAllocationResponse] = []

    class Config:
        from_attributes = True


class PaymentAllocateRequest(BaseModel):
    """Запрос на распределение оплаты по начислениям"""
    allocations: List[PaymentAllocationCreate]
