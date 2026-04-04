from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime

from app.api.deps import DB, CurrentUser, StaffUser
from app.models.appeal import Appeal, AppealStatus
from app.models.plot import Plot
from app.models.user import UserRole
from app.schemas.appeal import AppealCreate, AppealResponse, AppealRespond
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/appeals", tags=["appeals"])


@router.get("", response_model=PaginatedResponse[AppealResponse])
async def get_appeals(
    db: DB,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(100, ge=1, le=200),
    status_filter: Optional[AppealStatus] = Query(None, alias="status"),
):
    query = select(Appeal)
    count_query = select(func.count(Appeal.id))

    if current_user.role == UserRole.OWNER:
        plot_ids_result = await db.execute(
            select(Plot.id).where(Plot.owner_id == current_user.id)
        )
        my_plot_ids = plot_ids_result.scalars().all()

        if not my_plot_ids:
            return PaginatedResponse(
                items=[],
                total=0,
                page=page,
                per_page=per_page,
                pages=0,
            )

        query = query.where(Appeal.plot_id.in_(my_plot_ids))
        count_query = count_query.where(Appeal.plot_id.in_(my_plot_ids))

    if status_filter:
        query = query.where(Appeal.status == status_filter)
        count_query = count_query.where(Appeal.status == status_filter)

    query = query.order_by(Appeal.created_at.desc(), Appeal.id.desc())

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    appeals = result.scalars().all()

    return PaginatedResponse(
        items=appeals,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.post("", response_model=AppealResponse, status_code=status.HTTP_201_CREATED)
async def create_appeal(
    data: AppealCreate,
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

    if current_user.role == UserRole.OWNER and plot.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этому участку",
        )

    appeal = Appeal(
        **data.model_dump(),
        status=AppealStatus.NEW,
    )

    db.add(appeal)
    await db.commit()
    await db.refresh(appeal)

    return appeal


@router.post("/{appeal_id}/respond", response_model=AppealResponse)
async def respond_appeal(
    appeal_id: int,
    data: AppealRespond,
    db: DB,
    current_user: StaffUser,
):
    result = await db.execute(select(Appeal).where(Appeal.id == appeal_id))
    appeal = result.scalar_one_or_none()

    if not appeal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обращение не найдено",
        )

    appeal.response = data.response
    appeal.status = data.status

    if data.status in (AppealStatus.RESOLVED, AppealStatus.REJECTED):
        appeal.resolved_at = datetime.utcnow()
    else:
        appeal.resolved_at = None

    await db.commit()
    await db.refresh(appeal)

    return appeal


@router.delete("/{appeal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appeal(
    appeal_id: int,
    db: DB,
    current_user: StaffUser,
):
    result = await db.execute(select(Appeal).where(Appeal.id == appeal_id))
    appeal = result.scalar_one_or_none()

    if not appeal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обращение не найдено",
        )

    await db.delete(appeal)
    await db.commit()


@router.get("/{appeal_id}", response_model=AppealResponse)
async def get_appeal(
    appeal_id: int,
    db: DB,
    current_user: CurrentUser,
):
    result = await db.execute(select(Appeal).where(Appeal.id == appeal_id))
    appeal = result.scalar_one_or_none()

    if not appeal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обращение не найдено",
        )

    if current_user.role == UserRole.OWNER:
        plot_result = await db.execute(select(Plot).where(Plot.id == appeal.plot_id))
        plot = plot_result.scalar_one_or_none()

        if not plot or plot.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет доступа к этому обращению",
            )

    return appeal
