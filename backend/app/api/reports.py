from fastapi import APIRouter
from sqlalchemy import select, func
from typing import List

from app.api.deps import DB, StaffUser
from app.models.plot import Plot
from app.models.user import User, UserRole
from app.models.payment import Charge, Payment
from app.schemas.plot import PlotBalance
from pydantic import BaseModel


router = APIRouter(prefix="/reports", tags=["reports"])


class FinancialSummary(BaseModel):
    total_plots: int
    total_owners: int
    total_charged: float
    total_paid: float
    total_debt: float
    total_overpaid: float
    collection_rate: float


class DebtorInfo(BaseModel):
    plot_id: int
    plot_number: str
    owner_name: str
    owner_phone: str
    owner_email: str
    total_charged: float
    total_paid: float
    debt: float


class PeriodSummary(BaseModel):
    period: str
    total_charged: float
    total_paid: float
    total_debt: float
    plots_count: int
    paid_count: int
    debt_count: int


@router.get("/summary", response_model=FinancialSummary)
async def get_financial_summary(
    db: DB,
    current_user: StaffUser,
):
    total_plots_result = await db.execute(select(func.count(Plot.id)))
    total_plots = total_plots_result.scalar() or 0

    total_owners_result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.OWNER)
    )
    total_owners = total_owners_result.scalar() or 0

    total_charged_result = await db.execute(
        select(func.coalesce(func.sum(Charge.amount), 0))
    )
    total_charged = float(total_charged_result.scalar() or 0)

    total_paid_result = await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0))
    )
    total_paid = float(total_paid_result.scalar() or 0)

    total_debt = max(total_charged - total_paid, 0.0)
    total_overpaid = max(total_paid - total_charged, 0.0)
    collection_rate = round((total_paid / total_charged * 100), 1) if total_charged > 0 else 0.0

    return FinancialSummary(
        total_plots=total_plots,
        total_owners=total_owners,
        total_charged=total_charged,
        total_paid=total_paid,
        total_debt=total_debt,
        total_overpaid=total_overpaid,
        collection_rate=collection_rate,
    )


@router.get("/debtors", response_model=List[DebtorInfo])
async def get_debtors(
    db: DB,
    current_user: StaffUser,
):
    plots_result = await db.execute(
        select(Plot).where(Plot.owner_id.isnot(None)).order_by(Plot.number)
    )
    plots = plots_result.scalars().all()

    debtors = []

    for plot in plots:
        charged_result = await db.execute(
            select(func.coalesce(func.sum(Charge.amount), 0))
            .where(Charge.plot_id == plot.id)
        )
        total_charged = float(charged_result.scalar() or 0)

        paid_result = await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0))
            .where(Payment.plot_id == plot.id)
        )
        total_paid = float(paid_result.scalar() or 0)

        debt = total_charged - total_paid

        if debt > 0:
            owner_result = await db.execute(
                select(User).where(User.id == plot.owner_id)
            )
            owner = owner_result.scalar_one_or_none()

            debtors.append(
                DebtorInfo(
                    plot_id=plot.id,
                    plot_number=plot.number,
                    owner_name=owner.full_name if owner else "—",
                    owner_phone=owner.phone if owner else "—",
                    owner_email=owner.email if owner else "—",
                    total_charged=total_charged,
                    total_paid=total_paid,
                    debt=debt,
                )
            )

    debtors.sort(key=lambda x: x.debt, reverse=True)
    return debtors


@router.get("/balances", response_model=List[PlotBalance])
async def get_all_balances(
    db: DB,
    current_user: StaffUser,
):
    plots_result = await db.execute(select(Plot).order_by(Plot.number))
    plots = plots_result.scalars().all()

    balances = []

    for plot in plots:
        charged_result = await db.execute(
            select(func.coalesce(func.sum(Charge.amount), 0))
            .where(Charge.plot_id == plot.id)
        )
        total_charged = float(charged_result.scalar() or 0)

        paid_result = await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0))
            .where(Payment.plot_id == plot.id)
        )
        total_paid = float(paid_result.scalar() or 0)

        owner_name = "—"
        if plot.owner_id:
            owner_result = await db.execute(
                select(User).where(User.id == plot.owner_id)
            )
            owner = owner_result.scalar_one_or_none()
            if owner:
                owner_name = owner.full_name

        balances.append(
            PlotBalance(
                plot_id=plot.id,
                plot_number=plot.number,
                owner_name=owner_name,
                total_charged=total_charged,
                total_paid=total_paid,
                balance=total_paid - total_charged,
            )
        )

    return balances


@router.get("/periods", response_model=List[PeriodSummary])
async def get_period_summaries(
    db: DB,
    current_user: StaffUser,
):
    periods_result = await db.execute(
        select(Charge.period).distinct().order_by(Charge.period.desc())
    )
    periods = periods_result.scalars().all()

    result_data = []

    for period in periods:
        charged_result = await db.execute(
            select(func.coalesce(func.sum(Charge.amount), 0))
            .where(Charge.period == period)
        )
        total_charged = float(charged_result.scalar() or 0)

        plots_count_result = await db.execute(
            select(func.count(func.distinct(Charge.plot_id)))
            .where(Charge.period == period)
        )
        plots_count = plots_count_result.scalar() or 0

        # Сколько оплат было вообще по участкам, у которых есть начисления за этот период
        charged_plot_ids_result = await db.execute(
            select(Charge.plot_id).where(Charge.period == period)
        )
        charged_plot_ids = list(set(charged_plot_ids_result.scalars().all()))

        if charged_plot_ids:
            paid_result = await db.execute(
                select(func.coalesce(func.sum(Payment.amount), 0))
                .where(Payment.plot_id.in_(charged_plot_ids))
            )
            total_paid = float(paid_result.scalar() or 0)

            paid_count_result = await db.execute(
                select(func.count(func.distinct(Payment.plot_id)))
                .where(Payment.plot_id.in_(charged_plot_ids))
            )
            paid_count = paid_count_result.scalar() or 0
        else:
            total_paid = 0.0
            paid_count = 0

        total_debt = max(total_charged - total_paid, 0.0)

        debt_count = max(plots_count - paid_count, 0)

        result_data.append(
            PeriodSummary(
                period=period,
                total_charged=total_charged,
                total_paid=total_paid,
                total_debt=total_debt,
                plots_count=plots_count,
                paid_count=paid_count,
                debt_count=debt_count,
            )
        )

    return result_data
