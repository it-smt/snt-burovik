from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/snt_burovik"

    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Email
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_NAME: str = "СОНТ Буровик"
    EMAILS_FROM_EMAIL: str = "noreply@snt-burovik.ru"

    # App
    APP_NAME: str = "СОНТ Буровик"
    DEBUG: bool = True

    # First admin
    FIRST_ADMIN_EMAIL: str = "admin@snt-burovik.local"
    FIRST_ADMIN_PASSWORD: str = "admin123456"
    FIRST_ADMIN_FULL_NAME: str = "Системный администратор"
    FIRST_ADMIN_PHONE: str = "+79990000000"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
