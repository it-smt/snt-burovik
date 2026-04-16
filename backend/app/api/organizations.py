# app/api/organizations.py

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import DB, StaffUser
from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationResponse

router = APIRouter(prefix="/organization", tags=["organization"])


@router.get("", response_model=OrganizationResponse)
async def get_organization(db: DB, current_user: StaffUser):
    """Получить данные организации (СНТ)"""
    result = await db.execute(select(Organization).limit(1))
    org = result.scalar_one_or_none()
    
    if not org:
        # Если организация ещё не создана, возвращаем пустой объект
        return OrganizationResponse(
            id=0,
            name="",
            address="",
            inn=None,
            kpp=None,
            contact_phone=None,
            contact_email=None,
            bank_account=None,
            bank_name=None,
            bik=None,
            description=None,
        )
    
    return org


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(data: OrganizationCreate, db: DB, current_user: StaffUser):
    """Создать организацию (СНТ)"""
    # Проверяем, существует ли уже организация
    result = await db.execute(select(Organization).limit(1))
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Организация уже существует. Используйте обновление данных.",
        )
    
    org = Organization(**data.model_dump())
    db.add(org)
    await db.commit()
    await db.refresh(org)
    
    return org


@router.patch("", response_model=OrganizationResponse)
async def update_organization(data: OrganizationUpdate, db: DB, current_user: StaffUser):
    """Обновить данные организации (СНТ)"""
    result = await db.execute(select(Organization).limit(1))
    org = result.scalar_one_or_none()
    
    if not org:
        # Если организации нет, создаём её
        create_data = OrganizationCreate(
            name=data.name or "СНТ",
            address=data.address or "",
            inn=data.inn,
            kpp=data.kpp,
            contact_phone=data.contact_phone,
            contact_email=data.contact_email,
            bank_account=data.bank_account,
            bank_name=data.bank_name,
            bik=data.bik,
            description=data.description,
        )
        org = Organization(**create_data.model_dump())
        db.add(org)
    else:
        # Обновляем существующую
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(org, field, value)
    
    await db.commit()
    await db.refresh(org)
    
    return org
