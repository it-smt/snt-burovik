# app/schemas/organization.py

from pydantic import BaseModel, Field
from typing import Optional


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Название СНТ")
    address: str = Field(..., min_length=1, max_length=500, description="Юридический адрес")
    inn: Optional[str] = Field(None, max_length=20, description="ИНН")
    kpp: Optional[str] = Field(None, max_length=20, description="КПП")
    contact_phone: Optional[str] = Field(None, max_length=50, description="Контактный телефон")
    contact_email: Optional[str] = Field(None, max_length=255, description="Контактный email")
    bank_account: Optional[str] = Field(None, max_length=50, description="Расчётный счёт")
    bank_name: Optional[str] = Field(None, max_length=255, description="Название банка")
    bik: Optional[str] = Field(None, max_length=20, description="БИК банка")
    description: Optional[str] = Field(None, description="Описание")


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    inn: Optional[str] = Field(None, max_length=20)
    kpp: Optional[str] = Field(None, max_length=20)
    contact_phone: Optional[str] = Field(None, max_length=50)
    contact_email: Optional[str] = Field(None, max_length=255)
    bank_account: Optional[str] = Field(None, max_length=50)
    bank_name: Optional[str] = Field(None, max_length=255)
    bik: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    id: int

    class Config:
        from_attributes = True
