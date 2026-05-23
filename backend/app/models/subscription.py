from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Plan(str):
    FREE = "free"
    GROWTH = "growth"
    PRO = "pro"


PLAN_LIMITS = {
    "free": {
        "max_riders": 3,
        "max_orders_per_month": 50,
        "max_dispatchers": 1,
        "sms_notifications": False,
        "csv_export": False,
        "api_access": False,
    },
    "growth": {
        "max_riders": 20,
        "max_orders_per_month": None,  # unlimited
        "max_dispatchers": 5,
        "sms_notifications": True,
        "csv_export": True,
        "api_access": False,
    },
    "pro": {
        "max_riders": None,  # unlimited
        "max_orders_per_month": None,
        "max_dispatchers": None,
        "sms_notifications": True,
        "csv_export": True,
        "api_access": True,
    },
}

PLAN_PRICES = {
    "free": 0,
    "growth": 199,
    "pro": 499,
}


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, unique=True)
    plan = Column(String, default="free")
    is_active = Column(Boolean, default=True)
    paystack_reference = Column(String, nullable=True)
    paystack_subscription_code = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company")