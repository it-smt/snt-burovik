from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
import asyncio

from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_database_if_not_exists():
    """
    Подключается к серверу PostgreSQL (к дефолтной БД postgres)
    и создаёт базу snt_burovik, если она ещё не существует.
    """
    # Формируем URL для подключения к системной БД postgres
    # Заменяем имя базы в URL на "postgres"
    base_url = settings.DATABASE_URL
    # asyncpg://user:pass@host:port/snt_burovik -> asyncpg://user:pass@host:port/postgres
    if "/snt_burovik" in base_url:
        admin_url = base_url.rsplit("/snt_burovik", 1)[0] + "/postgres"
    else:
        # Если URL имеет другой формат, пытаемся заменить последний сегмент
        parts = base_url.rsplit("/", 1)
        admin_url = parts[0] + "/postgres"

    admin_engine = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")

    async with admin_engine.connect() as conn:
        # Проверяем, существует ли БД
        result = await conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = 'snt_burovik'")
        )
        exists = result.scalar() is not None

        if not exists:
            await conn.execute(text("CREATE DATABASE snt_burovik"))
            print("✅ База данных 'snt_burovik' создана")
        else:
            print("ℹ️ База данных 'snt_burovik' уже существует")

    await admin_engine.dispose()


async def init_db():
    """
    1. Создаёт БД snt_burovik, если не существует.
    2. Создаёт все таблицы из метаданных моделей.
    """
    await create_database_if_not_exists()

    # Импортируем все модели, чтобы Base.metadata знал о них
    # (убедитесь, что все модели импортированы до вызова create_all)
    from app import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Таблицы созданы/проверены")
