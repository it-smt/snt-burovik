# app/models/activity.py

from sqlalchemy import String, Text, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import TYPE_CHECKING
import enum

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class ActivityAction(str, enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    VERIFY = "verify"
    RESPOND = "respond"


class ActivityLog(Base):
    """Модель для логирования действий пользователей"""
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action: Mapped[ActivityAction] = mapped_column(nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # user, plot, payment, charge, meter, announcement, appeal
    entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    entity_name: Mapped[str] = mapped_column(String(255), nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationship
    user: Mapped["User"] = relationship("User", backref="activity_logs")
