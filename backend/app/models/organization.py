# app/models/organization.py

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Organization(Base):
    """Модель организации (СНТ)"""
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, comment="Название СНТ")
    address: Mapped[str] = mapped_column(String(500), nullable=False, comment="Юридический адрес")
    inn: Mapped[str | None] = mapped_column(String(20), nullable=True, comment="ИНН")
    kpp: Mapped[str | None] = mapped_column(String(20), nullable=True, comment="КПП")
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True, comment="Контактный телефон")
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True, comment="Контактный email")
    bank_account: Mapped[str | None] = mapped_column(String(50), nullable=True, comment="Расчётный счёт")
    bank_name: Mapped[str | None] = mapped_column(String(255), nullable=True, comment="Название банка")
    bik: Mapped[str | None] = mapped_column(String(20), nullable=True, comment="БИК банка")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Описание")

    # Отношения - можно добавить связь с пользователями если нужно
    # updated_by: Mapped[list["User"]] = relationship("User", back_populates="organizations")
