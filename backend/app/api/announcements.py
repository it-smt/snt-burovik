from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, or_
from typing import Optional
from datetime import date

from app.api.deps import DB, CurrentUser, StaffUser
from app.models.announcement import Announcement
from app.models.activity import ActivityAction
from app.utils.activity_logger import log_activity
from app.schemas.announcement import AnnouncementCreate, AnnouncementResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("", response_model=PaginatedResponse[AnnouncementResponse])
async def get_announcements(
    db: DB,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
):
    query = select(Announcement)
    count_query = select(func.count(Announcement.id))

    # Только неистёкшие или без даты окончания
    actual_filter = or_(
        Announcement.expires_at.is_(None),
        Announcement.expires_at >= date.today(),
    )

    query = query.where(actual_filter)
    count_query = count_query.where(actual_filter)

    if search:
        search_filter = or_(
            Announcement.title.ilike(f"%{search}%"),
            Announcement.content.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    query = query.order_by(
        Announcement.is_important.desc(),
        Announcement.published_at.desc(),
        Announcement.id.desc(),
    )

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    announcements = result.scalars().all()

    return PaginatedResponse(
        items=announcements,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.post("", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    data: AnnouncementCreate,
    db: DB,
    current_user: StaffUser,
):
    announcement = Announcement(
        **data.model_dump(),
        author_id=current_user.id,
    )

    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)

    # Log activity
    await log_activity(
        db=db,
        user_id=current_user.id,
        action=ActivityAction.CREATE,
        entity_type="announcement",
        entity_id=announcement.id,
        entity_name=announcement.title,
        details=f"Создано объявление: {announcement.title}",
    )

    return announcement


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: int,
    db: DB,
    current_user: StaffUser,
):
    result = await db.execute(
        select(Announcement).where(Announcement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()

    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Объявление не найдено",
        )

    # Store info for logging before deletion
    announcement_title = announcement.title
    announcement_id_for_log = announcement.id

    await db.delete(announcement)
    await db.commit()

    # Log activity
    await log_activity(
        db=db,
        user_id=current_user.id,
        action=ActivityAction.DELETE,
        entity_type="announcement",
        entity_id=announcement_id_for_log,
        entity_name=announcement_title,
        details=f"Удалено объявление: {announcement_title}",
    )
