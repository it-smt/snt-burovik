# app/api/users.py

from fastapi import APIRouter, HTTPException, status, Query, Depends
from pydantic import BaseModel
from sqlalchemy import select, func, or_
from typing import Optional
import secrets

from app.api.deps import DB, AdminUser, get_current_user
from app.models.user import User, UserRole
from app.models.activity import ActivityAction
from app.utils.activity_logger import log_activity
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserInDB
from app.schemas.common import PaginatedResponse
from app.utils.security import get_password_hash, verify_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=PaginatedResponse[UserResponse])
async def get_users(
    db: DB,
    current_user: AdminUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
):
    query = select(User)
    count_query = select(func.count(User.id))

    if search:
        search_filter = or_(
            User.full_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.phone.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)

    # Total count
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginated results
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    users = result.scalars().all()

    return PaginatedResponse(
        items=users,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, db: DB, current_user: AdminUser):
    # Check email exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )

    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=data.role,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Log activity
    await log_activity(
        db=db,
        user_id=current_user.id,
        action=ActivityAction.CREATE,
        entity_type="user",
        entity_id=user.id,
        entity_name=f"{user.full_name} ({user.email})",
        details=f"Создан пользователь {user.full_name} (роль: {user.role.value})",
    )

    return user


@router.get("/me", response_model=UserResponse)
async def get_me(db: DB, current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    db: DB,
    current_user: User = Depends(get_current_user),
):
    # Проверка: пользователь может редактировать только себя
    update_data = data.model_dump(exclude_unset=True, exclude_none=True)
    
    # Нельзя изменить роль через этот метод
    if "role" in update_data:
        del update_data["role"]
    
    # Нельзя изменить is_active через этот метод
    if "is_active" in update_data:
        del update_data["is_active"]

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: DB, current_user: AdminUser):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, data: UserUpdate, db: DB, current_user: AdminUser):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    update_data = data.model_dump(exclude_unset=True)
    
    # Store old values for logging
    old_values = {}
    for field, value in update_data.items():
        if hasattr(user, field):
            old_values[field] = getattr(user, field)
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)

    # Log activity
    changes = ", ".join([f"{k}: {old_values[k]} -> {update_data[k]}" for k in update_data.keys() if k in old_values])
    await log_activity(
        db=db,
        user_id=current_user.id,
        action=ActivityAction.UPDATE,
        entity_type="user",
        entity_id=user.id,
        entity_name=f"{user.full_name} ({user.email})",
        details=f"Изменения: {changes}" if changes else "Обновлен пользователь",
    )

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: DB, current_user: AdminUser):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    # Store info for logging before deletion
    user_name = user.full_name
    user_email = user.email
    user_id_for_log = user.id

    await db.delete(user)
    await db.commit()

    # Log activity
    await log_activity(
        db=db,
        user_id=current_user.id,
        action=ActivityAction.DELETE,
        entity_type="user",
        entity_id=user_id_for_log,
        entity_name=f"{user_name} ({user_email})",
        details=f"Удален пользователь {user_name} (email: {user_email})",
    )


@router.post("/{user_id}/reset-password")
async def reset_password(user_id: int, db: DB, current_user: AdminUser):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    # Generate random password
    temp_password = secrets.token_urlsafe(8)
    user.hashed_password = get_password_hash(temp_password)

    await db.commit()

    return {"temp_password": temp_password}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    db: DB,
    current_user: User = Depends(get_current_user),
):
    # Verify current password
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль",
        )

    # Update password
    current_user.hashed_password = get_password_hash(data.new_password)
    await db.commit()

    return {"message": "Пароль изменён"}
