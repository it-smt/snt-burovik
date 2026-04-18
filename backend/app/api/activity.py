# app/api/activity.py

from fastapi import APIRouter, Query
from sqlalchemy import select
from typing import List

from app.api.deps import DB, CurrentUser
from app.models.activity import ActivityLog
from app.schemas.activity import ActivityLogResponse

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("", response_model=List[ActivityLogResponse])
async def get_activity_logs(
    db: DB,
    current_user: CurrentUser,
    limit: int = Query(20, ge=1, le=100),
):
    """Получить последние действия пользователей"""
    result = await db.execute(
        select(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    )
    logs = result.scalars().all()
    
    # Преобразуем в формат ответа с именем пользователя
    response_logs = []
    for log in logs:
        response_logs.append(
            ActivityLogResponse(
                id=log.id,
                user_id=log.user_id,
                user_name=log.user.full_name if log.user else "Неизвестный",
                action=log.action.value if hasattr(log.action, 'value') else log.action,
                entity_type=log.entity_type,
                entity_id=log.entity_id,
                entity_name=log.entity_name,
                details=log.details,
                created_at=log.created_at,
            )
        )
    
    return response_logs
