# app/main.py

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth, users, plots, tariffs, payments, meters, announcements, appeals, reports, organizations, activity
from app.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: инициализация БД
    await init_db()
    yield
    # Shutdown: здесь можно добавить очистку ресурсов

app = FastAPI(
    title=settings.APP_NAME,
    description="API для управления садоводческим товариществом",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(plots.router, prefix="/api/v1")
app.include_router(tariffs.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(meters.router, prefix="/api/v1")
app.include_router(announcements.router, prefix="/api/v1")
app.include_router(appeals.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(organizations.router, prefix="/api/v1")
app.include_router(activity.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.APP_NAME} API"}


@app.get("/health")
async def health():
    return {"status": "ok"}
