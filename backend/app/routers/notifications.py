from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order
from app.models.user import User
from app.services.sms_service import (
    send_order_assigned_sms,
    send_order_delivered_sms,
    send_order_failed_sms
)
from app.utils.dependencies import require_dispatcher
from app.services.subscription_service import check_sms_access

router = APIRouter()


@router.post("/sms/assigned/{order_id}")
async def notify_assigned(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher)
):
    from app.utils.dependencies import get_current_company
    check_sms_access(db, current_user.company_id)
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    sent = await send_order_assigned_sms(order.customer_phone, order.tracking_code)
    return {"sent": sent, "phone": order.customer_phone}


@router.post("/sms/delivered/{order_id}")
async def notify_delivered(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    sent = await send_order_delivered_sms(order.customer_phone, order.tracking_code)
    return {"sent": sent, "phone": order.customer_phone}


@router.post("/sms/failed/{order_id}")
async def notify_failed(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    reason = order.failure_reason or "Unknown reason"
    sent = await send_order_failed_sms(order.customer_phone, order.tracking_code, reason)
    return {"sent": sent, "phone": order.customer_phone}