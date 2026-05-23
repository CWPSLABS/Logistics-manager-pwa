from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.subscription import Subscription, PLAN_LIMITS, PLAN_PRICES
from app.models.rider import Rider
from app.models.order import Order
from app.utils.dependencies import get_current_user, get_current_company, require_admin
from app.services.subscription_service import (
    get_or_create_subscription, upgrade_plan,
    get_plan_limits, cancel_subscription,
    restore_subscription, set_expiry
)
from app.services.payment_service import verify_paystack_payment
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter()


@router.get("/")
def get_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    sub = get_or_create_subscription(db, company.id)
    limits = get_plan_limits(sub.plan)

    # Check if expired
    is_expired = False
    if sub.expires_at:
        expires_at_aware = sub.expires_at.replace(tzinfo=timezone.utc) if sub.expires_at.tzinfo is None else sub.expires_at
        is_expired = expires_at_aware < datetime.now(timezone.utc)

    return {
        "plan": sub.plan,
        "is_active": sub.is_active,
        "is_expired": is_expired,
        "expires_at": sub.expires_at,
        "started_at": sub.started_at,
        "paystack_reference": sub.paystack_reference,
        "limits": limits,
        "prices": PLAN_PRICES,
    }


@router.get("/usage")
def get_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    sub = get_or_create_subscription(db, company.id)
    limits = get_plan_limits(sub.plan)

    # Count current usage
    rider_count = db.query(Rider).filter(Rider.company_id == company.id).count()

    dispatcher_count = db.query(User).filter(
        User.company_id == company.id,
        User.role == UserRole.dispatcher
    ).count()

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    order_count = db.query(Order).filter(
        Order.company_id == company.id,
        Order.created_at >= month_start
    ).count()

    return {
        "plan": sub.plan,
        "usage": {
            "riders": {
                "used": rider_count,
                "limit": limits["max_riders"],
                "unlimited": limits["max_riders"] is None,
            },
            "dispatchers": {
                "used": dispatcher_count,
                "limit": limits["max_dispatchers"],
                "unlimited": limits["max_dispatchers"] is None,
            },
            "orders_this_month": {
                "used": order_count,
                "limit": limits["max_orders_per_month"],
                "unlimited": limits["max_orders_per_month"] is None,
            },
        },
        "features": {
            "sms_notifications": limits["sms_notifications"],
            "csv_export": limits["csv_export"],
            "api_access": limits["api_access"],
        }
    }


@router.get("/plans")
def get_plans():
    return {
        "plans": [
            {
                "id": "free",
                "name": "Starter",
                "price": PLAN_PRICES["free"],
                "currency": "GHS",
                "limits": PLAN_LIMITS["free"],
                "features": [
                    "1 dispatcher account",
                    "Up to 3 riders",
                    "Up to 50 orders/month",
                    "Basic dashboard",
                    "Customer tracking page",
                ],
            },
            {
                "id": "growth",
                "name": "Growth",
                "price": PLAN_PRICES["growth"],
                "currency": "GHS",
                "limits": PLAN_LIMITS["growth"],
                "features": [
                    "Up to 5 dispatchers",
                    "Up to 20 riders",
                    "Unlimited orders",
                    "SMS notifications",
                    "CSV exports",
                    "Priority support",
                ],
            },
            {
                "id": "pro",
                "name": "Pro",
                "price": PLAN_PRICES["pro"],
                "currency": "GHS",
                "limits": PLAN_LIMITS["pro"],
                "features": [
                    "Unlimited dispatchers",
                    "Unlimited riders",
                    "Unlimited orders",
                    "SMS notifications",
                    "CSV exports",
                    "API access",
                    "Dedicated support",
                ],
            },
        ]
    }


class UpgradePayload(BaseModel):
    plan: str
    reference: str


@router.post("/upgrade")
async def upgrade_subscription(
    payload: UpgradePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    from app.config import get_settings
    settings = get_settings()

    if payload.plan not in ["free", "growth", "pro"]:
        raise HTTPException(status_code=400, detail="Invalid plan")

    if payload.plan != "free" and settings.app_env == "production":
        is_valid = await verify_paystack_payment(payload.reference)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Payment verification failed")

    sub = upgrade_plan(db, company.id, payload.plan, payload.reference)
    sub = set_expiry(db, company.id, months=1)

    return {
        "message": f"Successfully upgraded to {payload.plan} plan",
        "plan": sub.plan,
        "expires_at": sub.expires_at,
    }


@router.post("/initialize-payment")
def initialize_payment(
    plan: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    if plan not in ["growth", "pro"]:
        raise HTTPException(status_code=400, detail="Invalid plan for payment")

    amount = PLAN_PRICES[plan] * 100

    return {
        "email": current_user.email,
        "amount": amount,
        "plan": plan,
        "currency": "GHS",
        "metadata": {
            "company_id": company.id,
            "plan": plan,
        }
    }


@router.post("/cancel")
def cancel_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    sub = cancel_subscription(db, company.id)
    return {
        "message": "Subscription cancelled. You will retain access until your billing period ends.",
        "plan": sub.plan,
        "is_active": sub.is_active,
    }


@router.post("/restore")
def restore_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    sub = restore_subscription(db, company.id)
    return {
        "message": "Subscription restored successfully.",
        "plan": sub.plan,
        "is_active": sub.is_active,
    }


@router.post("/downgrade")
def downgrade_to_free(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    sub = upgrade_plan(db, company.id, "free", None)
    sub.expires_at = None
    sub.is_active = True
    db.commit()
    db.refresh(sub)

    company.plan = "free"
    db.commit()

    return {
        "message": "Downgraded to free plan.",
        "plan": "free",
    }