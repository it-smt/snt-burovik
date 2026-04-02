# app/api/plots.py

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.api.deps import DB, CurrentUser, StaffUser
from app.models.plot import Plot
from app.models.user import User, UserRole
from app.models.payment import Charge, Payment
from app.schemas.plot import PlotCreate, PlotUpdate, PlotResponse, PlotBalance
from app.schemas.common import PaginatedResponse
from app.schemas.user import UserResponse

router = APIRouter(prefix="/plots", tags=["plots"])


@router.get("", response_model=PaginatedResponse[PlotResponse])
async def get_plots(
    db: DB,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    has_owner: Optional[bool] = None,
):
    query = select(Plot).options(selectinload(Plot.owner))
    count_query = select(func.count(Plot.id))

    # Владелец видит только свои участки
    if current_user.role == UserRole.OWNER:
        query = query.where(Plot.owner_id == current_user.id)
        count_query = count_query.where(Plot.owner_id == current_user.id)

    if search:
        search_filter = or_(
            Plot.number.ilike(f"%{search}%"),
            Plot.address.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if has_owner is True:
        query = query.where(Plot.owner_id.isnot(None))
        count_query = count_query.where(Plot.owner_id.isnot(None))
    elif has_owner is False:
        query = query.where(Plot.owner_id.is_(None))
        count_query = count_query.where(Plot.owner_id.is_(None))

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    plots = result.scalars().all()

    return PaginatedResponse(
        items=plots,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.post("", response_model=PlotResponse, status_code=status.HTTP_201_CREATED)
async def create_plot(data: PlotCreate, db: DB, current_user: StaffUser):
    # Check number exists
    result = await db.execute(select(Plot).where(Plot.number == data.number))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Участок с таким номером уже существует",
        )

    plot = Plot(**data.model_dump())

    db.add(plot)
    await db.commit()
    await db.refresh(plot)

    # Load owner
    if plot.owner_id:
        await db.refresh(plot, ["owner"])

    return plot


@router.get("/my", response_model=List[PlotResponse])
async def get_my_plots(db: DB, current_user: CurrentUser):
    query = select(Plot).options(selectinload(Plot.owner)).where(Plot.owner_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/owners", response_model=List[UserResponse])
async def get_owners_list(db: DB, current_user: StaffUser):
    query = select(User).where(User.role == UserRole.OWNER, User.is_active == True)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/balances", response_model=List[PlotBalance])
async def get_all_balances(db: DB, current_user: CurrentUser):
    query = select(Plot).options(selectinload(Plot.owner))

    if current_user.role == UserRole.OWNER:
        query = query.where(Plot.owner_id == current_user.id)

    result = await db.execute(query)
    plots = result.scalars().all()

    balances = []
    for plot in plots:
        # Get charges
        charges_result = await db.execute(
            select(func.coalesce(func.sum(Charge.amount), 0))
            .where(Charge.plot_id == plot.id)
        )
        total_charged = float(charges_result.scalar())

        # Get payments
        payments_result = await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0))
            .where(Payment.plot_id == plot.id)
        )
        total_paid = float(payments_result.scalar())

        balances.append(PlotBalance(
            plot_id=plot.id,
            plot_number=plot.number,
            owner_name=plot.owner.full_name if plot.owner else "—",
            total_charged=total_charged,
            total_paid=total_paid,
            balance=total_paid - total_charged,
        ))

    return balances


@router.get("/{plot_id}", response_model=PlotResponse)
async def get_plot(plot_id: int, db: DB, current_user: CurrentUser):
    query = select(Plot).options(selectinload(Plot.owner)).where(Plot.id == plot_id)
    result = await db.execute(query)
    plot = result.scalar_one_or_none()

    if not plot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Участок не найден",
        )

    # Владелец может смотреть только свои участки
    if current_user.role == UserRole.OWNER and plot.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этому участку",
        )

    return plot


@router.get("/{plot_id}/balance", response_model=PlotBalance)
async def get_plot_balance(plot_id: int, db: DB, current_user: CurrentUser):
    query = select(Plot).options(selectinload(Plot.owner)).where(Plot.id == plot_id)
    result = await db.execute(query)
    plot = result.scalar_one_or_none()

    if not plot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Участок не найден",
        )

    if current_user.role == UserRole.OWNER and plot.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этому участку",
        )

    # Get charges
    charges_result = await db.execute(
        select(func.coalesce(func.sum(Charge.amount), 0))
        .where(Charge.plot_id == plot.id)
    )
    total_charged = float(charges_result.scalar())

    # Get payments
    payments_result = await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0))
        .where(Payment.plot_id == plot.id)
    )
    total_paid = float(payments_result.scalar())

    return PlotBalance(
        plot_id=plot.id,
        plot_number=plot.number,
        owner_name=plot.owner.full_name if plot.owner else "—",
        total_charged=total_charged,
        total_paid=total_paid,
        balance=total_paid - total_charged,
    )


@router.patch("/{plot_id}", response_model=PlotResponse)
async def update_plot(plot_id: int, data: PlotUpdate, db: DB, current_user: StaffUser):
    result = await db.execute(select(Plot).where(Plot.id == plot_id))
    plot = result.scalar_one_or_none()

    if not plot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Участок не найден",
        )

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(plot, field, value)

    await db.commit()
    await db.refresh(plot, ["owner"])

    return plot


@router.delete("/{plot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plot(plot_id: int, db: DB, current_user: StaffUser):
    result = await db.execute(select(Plot).where(Plot.id == plot_id))
    plot = result.scalar_one_or_none()

    if not plot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Участок не найден",
        )

    await db.delete(plot)
    await db.commit()
