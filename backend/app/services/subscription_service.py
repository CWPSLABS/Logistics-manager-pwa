from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.subscription import Subscription, PLAN_LIMITS
from app.models.company import Company
from app.models.order import Order
from app.models.rider import Rider
from app.models.user import User, UserRole
from fastapi import HTTPException
from datetime import datetime, timezone, timedelta


def get_or_create_subscription(db: Session, company_id: int) -> Subscription:
    sub = db.query(Subscription).filter(
        Subscription.company_id == company_id
    ).first()
    if not sub:
        sub = Subscription(company_id=company_id, plan="free")
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


def get_plan_limits(plan: str) -> dict:
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])


def check_rider_limit(db: Session, company_id: int) -> None:
    sub = get_or_create_subscription(db, company_id)
    limits = get_plan_limits(sub.plan)
    if limits["max_riders"] is None:
        return
    current_riders = db.query(Rider).filter(
        Rider.company_id == company_id
    ).count()
    if current_riders >= limits["max_riders"]:
        raise HTTPException(
            status_code=403,
            detail=f"Rider limit reached for {sub.plan} plan ({limits['max_riders']} max). Please upgrade."
        )


def check_order_limit(db: Session, company_id: int) -> None:
    sub = get_or_create_subscription(db, company_id)
    limits = get_plan_limits(sub.plan)
    if limits["max_orders_per_month"] is None:
        return
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_orders = db.query(Order).filter(
        Order.company_id == company_id,
        Order.created_at >= month_start
    ).count()
    if current_orders >= limits["max_orders_per_month"]:
        raise HTTPException(
            status_code=403,
            detail=f"Monthly order limit reached for {sub.plan} plan ({limits['max_orders_per_month']} max). Please upgrade."
        )


def check_dispatcher_limit(db: Session, company_id: int) -> None:
    sub = get_or_create_subscription(db, company_id)
    limits = get_plan_limits(sub.plan)
    if limits["max_dispatchers"] is None:
        return
    current_dispatchers = db.query(User).filter(
        User.company_id == company_id,
        User.role == UserRole.dispatcher
    ).count()
    if current_dispatchers >= limits["max_dispatchers"]:
        raise HTTPException(
            status_code=403,
            detail=f"Dispatcher limit reached for {sub.plan} plan ({limits['max_dispatchers']} max). Please upgrade."
        )


def check_csv_export(db: Session, company_id: int) -> None:
    sub = get_or_create_subscription(db, company_id)
    limits = get_plan_limits(sub.plan)
    if not limits["csv_export"]:
        raise HTTPException(
            status_code=403,
            detail="CSV export is not available on the free plan. Please upgrade."
        )


def check_sms_access(db: Session, company_id: int) -> None:
    sub = get_or_create_subscription(db, company_id)
    limits = get_plan_limits(sub.plan)
    if not limits["sms_notifications"]:
        raise HTTPException(
            status_code=403,
            detail="SMS notifications are not available on the free plan. Please upgrade."
        )


def upgrade_plan(db: Session, company_id: int, new_plan: str, reference: str = None) -> Subscription:
    sub = get_or_create_subscription(db, company_id)
    sub.plan = new_plan
    sub.paystack_reference = reference
    sub.is_active = True

    # Update company plan too
    company = db.query(Company).filter(Company.id == company_id).first()
    if company:
        company.plan = new_plan

    db.commit()
    db.refresh(sub)
    return sub


def cancel_subscription(db: Session, company_id: int) -> Subscription:
    sub = get_or_create_subscription(db, company_id)
    if sub.plan == "free":
        raise HTTPException(status_code=400, detail="Cannot cancel a free plan")
    sub.is_active = False
    db.commit()
    db.refresh(sub)
    return sub


def restore_subscription(db: Session, company_id: int) -> Subscription:
    sub = get_or_create_subscription(db, company_id)
    if sub.plan == "free":
        raise HTTPException(status_code=400, detail="Nothing to restore on free plan")
    sub.is_active = True
    db.commit()
    db.refresh(sub)
    return sub


def set_expiry(db: Session, company_id: int, months: int = 1) -> Subscription:
    sub = get_or_create_subscription(db, company_id)
    now = datetime.now(timezone.utc)
    sub.expires_at = now + timedelta(days=30 * months)
    db.commit()
    db.refresh(sub)
    return sub  