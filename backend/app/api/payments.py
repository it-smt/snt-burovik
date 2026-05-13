from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, and_, func as sa_func
from typing import Optional, List

from app.api.deps import DB, CurrentUser, StaffUser
from app.models.payment import Charge, Payment, PaymentAllocation
from app.models.plot import Plot
from app.models.tariff import Tariff
from app.models.user import UserRole
from app.schemas.payment import (
    ChargeCreate,
    ChargeResponse,
    MassChargeCreate,
    MassChargeResult,
    PaymentCreate,
    PaymentResponse,
    PaymentAllocateRequest,
)

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/charges", response_model=List[ChargeResponse])
async def get_charges(
    db: DB,
    current_user: CurrentUser,
    plot_id: Optional[int] = Query(None),
    period: Optional[str] = Query(None),
):
    query = select(Charge).order_by(Charge.created_at.desc(), Charge.id.desc())

    filters = []

    if plot_id is not None:
        filters.append(Charge.plot_id == plot_id)

    if period:
        filters.append(Charge.period == period)

    # Владельцу только свои участки
    if current_user.role == UserRole.OWNER:
        owner_plot_ids_result = await db.execute(
            select(Plot.id).where(Plot.owner_id == current_user.id)
        )
        owner_plot_ids = owner_plot_ids_result.scalars().all()

        if not owner_plot_ids:
            return []

        filters.append(Charge.plot_id.in_(owner_plot_ids))

    if filters:
        query = query.where(and_(*filters))

    result = await db.execute(query)
    charges = result.scalars().all()
    
    # Загружаем распределения для каждого начисления
    for charge in charges:
        await db.refresh(charge, attribute_names=["allocations"])
    
    return charges


@router.post("/charges", response_model=ChargeResponse, status_code=status.HTTP_201_CREATED)
async def create_charge(
    data: ChargeCreate,
    db: DB,
    current_user: StaffUser,
):
    # Проверяем участок
    plot_result = await db.execute(select(Plot).where(Plot.id == data.plot_id))
    plot = plot_result.scalar_one_or_none()
    if not plot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Участок не найден",
        )

    # Проверяем тариф
    tariff_result = await db.execute(select(Tariff).where(Tariff.id == data.tariff_id))
    tariff = tariff_result.scalar_one_or_none()
    if not tariff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тариф не найден",
        )

    charge = Charge(**data.model_dump())

    db.add(charge)
    await db.commit()
    await db.refresh(charge)

    return charge


@router.post("/charges/mass", response_model=MassChargeResult)
async def create_mass_charge(
    data: MassChargeCreate,
    db: DB,
    current_user: StaffUser,
):
    tariff_result = await db.execute(select(Tariff).where(Tariff.id == data.tariff_id))
    tariff = tariff_result.scalar_one_or_none()

    if not tariff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тариф не найден",
        )

    # Если plot_ids пустой — берём все участки с владельцем
    if data.plot_ids:
        plots_result = await db.execute(
            select(Plot).where(Plot.id.in_(data.plot_ids))
        )
    else:
        plots_result = await db.execute(
            select(Plot).where(Plot.owner_id.is_not(None))
        )

    plots = plots_result.scalars().all()

    if not plots:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нет участков для начисления",
        )

    created_count = 0
    skipped_count = 0
    total_amount = 0.0

    for plot in plots:
        # Проверяем, нет ли уже начисления на этот участок / тариф / период
        existing_result = await db.execute(
            select(Charge).where(
                Charge.plot_id == plot.id,
                Charge.tariff_id == data.tariff_id,
                Charge.period == data.period,
            )
        )
        existing_charge = existing_result.scalar_one_or_none()

        if existing_charge:
            skipped_count += 1
            continue

        amount = float(data.amount_per_plot) if data.amount_per_plot is not None else float(tariff.rate)

        charge = Charge(
            plot_id=plot.id,
            tariff_id=data.tariff_id,
            period=data.period,
            amount=amount,
            description=data.description,
        )

        db.add(charge)
        created_count += 1
        total_amount += amount

    await db.commit()

    return MassChargeResult(
        created_count=created_count,
        total_amount=total_amount,
        skipped_count=skipped_count,
    )


@router.get("/payments", response_model=List[PaymentResponse])
async def get_payments(
    db: DB,
    current_user: CurrentUser,
    plot_id: Optional[int] = Query(None),
):
    query = select(Payment).order_by(Payment.payment_date.desc(), Payment.id.desc())

    filters = []

    if plot_id is not None:
        filters.append(Payment.plot_id == plot_id)

    # Владельцу только свои участки
    if current_user.role == UserRole.OWNER:
        owner_plot_ids_result = await db.execute(
            select(Plot.id).where(Plot.owner_id == current_user.id)
        )
        owner_plot_ids = owner_plot_ids_result.scalars().all()

        if not owner_plot_ids:
            return []

        filters.append(Payment.plot_id.in_(owner_plot_ids))

    if filters:
        query = query.where(and_(*filters))

    result = await db.execute(query)
    payments = result.scalars().all()
    
    # Загружаем распределения для каждой оплаты
    for payment in payments:
        await db.refresh(payment, attribute_names=["allocations"])
    
    return payments


@router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: PaymentCreate,
    db: DB,
    current_user: StaffUser,
):
    plot_result = await db.execute(select(Plot).where(Plot.id == data.plot_id))
    plot = plot_result.scalar_one_or_none()

    if not plot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Участок не найден",
        )

    # Проверяем, что сумма распределений не превышает сумму оплаты
    total_allocated = sum(alloc.amount for alloc in data.allocations)
    if total_allocated > data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Сумма распределений ({total_allocated}) не может превышать сумму оплаты ({data.amount})",
        )

    # Создаём оплату
    payment_data = data.model_dump(exclude={"allocations"})
    payment = Payment(
        **payment_data,
        recorded_by=current_user.id,
    )

    db.add(payment)
    await db.flush()  # Получаем ID оплаты

    # Создаём распределения
    for alloc_data in data.allocations:
        # Проверяем начисление
        charge_result = await db.execute(
            select(Charge).where(Charge.id == alloc_data.charge_id)
        )
        charge = charge_result.scalar_one_or_none()
        
        if not charge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Начисление {alloc_data.charge_id} не найдено",
            )
        
        # Проверяем, что начисление относится к тому же участку
        if charge.plot_id != data.plot_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Начисление {alloc_data.charge_id} не относится к участку {data.plot_id}",
            )
        
        # Проверяем остаток к оплате
        remaining = charge.amount - sum(a.amount for a in charge.allocations) if hasattr(charge, 'allocations') else charge.amount
        if alloc_data.amount > remaining:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Сумма распределения ({alloc_data.amount}) превышает остаток по начислению ({remaining})",
            )
        
        allocation = PaymentAllocation(
            payment_id=payment.id,
            charge_id=alloc_data.charge_id,
            amount=alloc_data.amount,
        )
        db.add(allocation)

    await db.commit()
    await db.refresh(payment)
    await db.refresh(payment, attribute_names=["allocations"])

    return payment


@router.post("/payments/{payment_id}/allocate", response_model=PaymentResponse)
async def allocate_payment(
    payment_id: int,
    data: PaymentAllocateRequest,
    db: DB,
    current_user: StaffUser,
):
    """Распределить оплату по начислениям (для существующей оплаты)"""
    payment_result = await db.execute(
        select(Payment).where(Payment.id == payment_id)
    )
    payment = payment_result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Оплата не найдена",
        )
    
    # Проверяем, что сумма распределений не превышает не распределённый остаток
    current_allocated = sum(a.amount for a in payment.allocations) if payment.allocations else 0
    unallocated = payment.amount - current_allocated
    total_new_allocation = sum(alloc.amount for alloc in data.allocations)
    
    if total_new_allocation > unallocated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Сумма распределений ({total_new_allocation}) превышает не распределённый остаток ({unallocated})",
        )
    
    # Создаём распределения
    for alloc_data in data.allocations:
        # Проверяем начисление
        charge_result = await db.execute(
            select(Charge).where(Charge.id == alloc_data.charge_id)
        )
        charge = charge_result.scalar_one_or_none()
        
        if not charge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Начисление {alloc_data.charge_id} не найдено",
            )
        
        # Проверяем, что начисление относится к тому же участку
        if charge.plot_id != payment.plot_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Начисление {alloc_data.charge_id} не относится к участку {payment.plot_id}",
            )
        
        # Проверяем остаток к оплате
        existing_allocations_result = await db.execute(
            select(sa_func.sum(PaymentAllocation.amount)).where(
                PaymentAllocation.charge_id == alloc_data.charge_id
            )
        )
        paid_amount = existing_allocations_result.scalar() or 0
        remaining = charge.amount - paid_amount
        
        if alloc_data.amount > remaining:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Сумма распределения ({alloc_data.amount}) превышает остаток по начислению ({remaining})",
            )
        
        allocation = PaymentAllocation(
            payment_id=payment.id,
            charge_id=alloc_data.charge_id,
            amount=alloc_data.amount,
        )
        db.add(allocation)
    
    await db.commit()
    await db.refresh(payment)
    await db.refresh(payment, attribute_names=["allocations"])
    
    return payment
