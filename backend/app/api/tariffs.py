from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from typing import List

from app.api.deps import DB, CurrentUser, StaffUser
from app.models.tariff import Tariff
from app.schemas.tariff import TariffCreate, TariffUpdate, TariffResponse

router = APIRouter(prefix="/tariffs", tags=["tariffs"])


@router.get("", response_model=List[TariffResponse])
async def get_tariffs(db: DB, current_user: CurrentUser):
    result = await db.execute(
        select(Tariff).order_by(Tariff.effective_from.desc(), Tariff.id.desc())
    )
    return result.scalars().all()


@router.post("", response_model=TariffResponse, status_code=status.HTTP_201_CREATED)
async def create_tariff(data: TariffCreate, db: DB, current_user: StaffUser):
    tariff = Tariff(**data.model_dump())

    db.add(tariff)
    await db.commit()
    await db.refresh(tariff)

    return tariff


@router.patch("/{tariff_id}", response_model=TariffResponse)
async def update_tariff(
    tariff_id: int,
    data: TariffUpdate,
    db: DB,
    current_user: StaffUser,
):
    result = await db.execute(select(Tariff).where(Tariff.id == tariff_id))
    tariff = result.scalar_one_or_none()

    if not tariff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тариф не найден",
        )

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(tariff, field, value)

    await db.commit()
    await db.refresh(tariff)

    return tariff


@router.delete("/{tariff_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tariff(
    tariff_id: int,
    db: DB,
    current_user: StaffUser,
):
    result = await db.execute(select(Tariff).where(Tariff.id == tariff_id))
    tariff = result.scalar_one_or_none()

    if not tariff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тариф не найден",
        )

    await db.delete(tariff)
    await db.commit()
