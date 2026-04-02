# app/models/__init__.py

from app.models.user import User
from app.models.plot import Plot
from app.models.tariff import Tariff
from app.models.payment import Charge, Payment
from app.models.meter import MeterReading
from app.models.announcement import Announcement
from app.models.appeal import Appeal

__all__ = [
    "User",
    "Plot",
    "Tariff",
    "Charge",
    "Payment",
    "MeterReading",
    "Announcement",
    "Appeal",
]
