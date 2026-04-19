from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime

from app.api.deps import DB, CurrentUser, StaffUser
from app.models.appeal import Appeal, AppealStatus
from app.models.plot import Plot
from app.models.user import UserRole
from app.models.activity import ActivityAction
from app.utils.activity_logger import log_activity
from app.schemas.appeal import AppealCreate, AppealResponse, AppealRespond
from app.schemas.common import PaginatedResponse
from pydantic import BaseModel

router = APIRouter(prefix="/appeals", tags=["appeals"])


class AppealStats(BaseModel):
    new_count: int
    in_progress_count: int


@router.get("/stats", response_model=AppealStats)
async def get_appeal_stats(
    db: DB,
    current_user: StaffUser,
):
    """Получить статистику по обращениям (для бейджей)"""
    new_result = await db.execute(
        select(func.count(Appeal.id)).where(Appeal.status == AppealStatus.NEW)
    )
    new_count = new_result.scalar() or 0
    
    in_progress_result = await db.execute(
        select(func.count(Appeal.id)).where(Appeal.status == AppealStatus.IN_PROGRESS)
    )
    in_progress_count = in_progress_result.scalar() or 0
    
    return AppealStats(new_count=new_count, in_progress_count=in_progress_count)


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

    # Log activity
    await log_activity(
        db=db,
        user_id=current_user.id,
        action=ActivityAction.RESPOND,
        entity_type="appeal",
        entity_id=appeal.id,
        entity_name=f"Обращение #{appeal.id}",
        details=f"Ответ на обращение: статус {data.status.value}",
    )

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

    # Store info for logging before deletion
    appeal_id_for_log = appeal.id

    await db.delete(appeal)
    await db.commit()

    # Log activity
    await log_activity(
        db=db,
        user_id=current_user.id,
        action=ActivityAction.DELETE,
        entity_type="appeal",
        entity_id=appeal_id_for_log,
        entity_name=f"Обращение #{appeal_id_for_log}",
        details=f"Удалено обращение #{appeal_id_for_log}",
    )


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
