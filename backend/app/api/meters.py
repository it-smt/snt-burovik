from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime

from app.api.deps import DB, CurrentUser, StaffUser
from app.models.meter import MeterReading
from app.models.plot import Plot
from app.models.user import UserRole
from app.schemas.meter import MeterReadingCreate, MeterReadingResponse

router = APIRouter(prefix="/meters", tags=["meters"])


@router.get("", response_model=List[MeterReadingResponse])
async def get_readings(
    db: DB,
    current_user: CurrentUser,
    plot_id: Optional[int] = Query(None),
):
    query = select(MeterReading).order_by(
        MeterReading.reading_date.desc(),
        MeterReading.id.desc(),
    )

    if current_user.role == UserRole.OWNER:
        plot_ids_result = await db.execute(
            select(Plot.id).where(Plot.owner_id == current_user.id)
        )
        my_plot_ids = plot_ids_result.scalars().all()

        if not my_plot_ids:
            return []

        query = query.where(MeterReading.plot_id.in_(my_plot_ids))

    if plot_id is not None:
        # Для owner дополнительно ограничение уже есть выше
        query = query.where(MeterReading.plot_id == plot_id)

    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=MeterReadingResponse, status_code=status.HTTP_201_CREATED)
async def submit_reading(
    data: MeterReadingCreate,
    db: DB,
    current_user: CurrentUser,
):
    plot_result = await db.execute(select(Plot).where(Plot.id == data.plot_id))
    plot = plot_result.scalar_one_or_none()

    if not plot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Участок не найден",
        )

    # Владелец может передавать показания только по своим участкам
    if current_user.role == UserRole.OWNER and plot.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этому участку",
        )

    reading = MeterReading(
        **data.model_dump(),
        submitted_by=current_user.id,
    )

    db.add(reading)
    await db.commit()
    await db.refresh(reading)

    return reading


@router.post("/{reading_id}/verify", response_model=MeterReadingResponse)
async def verify_reading(
    reading_id: int,
    db: DB,
    current_user: StaffUser,
):
    result = await db.execute(
        select(MeterReading).where(MeterReading.id == reading_id)
    )
    reading = result.scalar_one_or_none()

    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Показание не найдено",
        )

    reading.is_verified = True
    reading.verified_by = current_user.id
    reading.verified_at = datetime.utcnow()

    await db.commit()
    await db.refresh(reading)

    return reading
