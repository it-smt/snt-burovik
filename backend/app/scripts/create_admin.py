from sqlalchemy import select

from app.config import settings
from app.database import async_session_maker
from app.models.user import User, UserRole
from app.utils.security import get_password_hash


async def create_admin():
    async with async_session_maker() as session:
        result = await session.execute(
            select(User).where(User.email == settings.FIRST_ADMIN_EMAIL)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            print(f"ℹ️ Пользователь с email {settings.FIRST_ADMIN_EMAIL} уже существует")
            return

        admin = User(
            email=settings.FIRST_ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
            full_name=settings.FIRST_ADMIN_FULL_NAME,
            phone=settings.FIRST_ADMIN_PHONE,
            role=UserRole.ADMIN,
            is_active=True,
        )

        session.add(admin)
        await session.commit()

        print("✅ Первый администратор создан")
        print(f"Email: {settings.FIRST_ADMIN_EMAIL}")
        print("Role: admin")


if __name__ == "__main__":
    import asyncio
    asyncio.run(create_admin())
