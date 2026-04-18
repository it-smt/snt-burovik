# app/utils/activity_logger.py

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity import ActivityLog, ActivityAction
from datetime import datetime


async def log_activity(
    db: AsyncSession,
    user_id: int,
    action: ActivityAction | str,
    entity_type: str,
    entity_id: int | None = None,
    entity_name: str = "",
    details: str | None = None,
) -> ActivityLog:
    """
    Логирование действий пользователя
    
    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        action: Действие (create, update, delete, verify, respond)
        entity_type: Тип сущности (user, plot, payment, charge, meter, announcement, appeal)
        entity_id: ID сущности (опционально)
        entity_name: Название/описание сущности
        details: Детали действия (опционально)
    
    Returns:
        Созданная запись ActivityLog
    """
    # Преобразуем строку в enum если нужно
    if isinstance(action, str):
        action = ActivityAction(action)
    
    log_entry = ActivityLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        details=details,
        created_at=datetime.utcnow(),
    )
    
    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    
    return log_entry
