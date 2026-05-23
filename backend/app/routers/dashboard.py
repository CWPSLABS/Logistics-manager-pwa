from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import io
from app.database import get_db
from app.models.order import Order, OrderStatus
from app.models.payment import Payment, PaymentStatus
from app.models.rider import Rider
from app.models.user import User
from app.models.company import Company
from app.utils.dependencies import require_dispatcher, get_current_company
from app.services.export_service import generate_orders_csv, generate_cod_csv
from app.services.subscription_service import check_csv_export

router = APIRouter()


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher),
    company: Company = Depends(get_current_company)
):
    today = datetime.utcnow().date()
    start = datetime.combine(today, datetime.min.time())
    end = datetime.combine(today, datetime.max.time())

    total = db.query(Order).filter(Order.company_id == company.id).count()
    today_total = db.query(Order).filter(
        Order.company_id == company.id,
        Order.created_at.between(start, end)
    ).count()
    pending = db.query(Order).filter(
        Order.company_id == company.id,
        Order.status == OrderStatus.pending
    ).count()
    in_transit = db.query(Order).filter(
        Order.company_id == company.id,
        Order.status == OrderStatus.in_transit
    ).count()
    delivered = db.query(Order).filter(
        Order.company_id == company.id,
        Order.status == OrderStatus.delivered
    ).count()
    failed = db.query(Order).filter(
        Order.company_id == company.id,
        Order.status == OrderStatus.failed
    ).count()

    total_revenue = db.query(func.sum(Order.amount)).filter(
        Order.company_id == company.id,
        Order.status == OrderStatus.delivered
    ).scalar() or 0

    today_revenue = db.query(func.sum(Order.amount)).filter(
        Order.company_id == company.id,
        Order.status == OrderStatus.delivered,
        Order.delivered_at.between(start, end)
    ).scalar() or 0

    cod_unreconciled = db.query(func.sum(Payment.amount)).filter(
        Payment.company_id == company.id,
        Payment.method == "cod",
        Payment.is_settled == False,
        Payment.status == PaymentStatus.confirmed
    ).scalar() or 0

    available_riders = db.query(Rider).filter(
        Rider.company_id == company.id,
        Rider.is_available == True
    ).count()

    return {
        "orders": {
            "total": total,
            "today": today_total,
            "pending": pending,
            "in_transit": in_transit,
            "delivered": delivered,
            "failed": failed,
        },
        "revenue": {
            "total": total_revenue,
            "today": today_revenue,
        },
        "cod_unreconciled": cod_unreconciled,
        "available_riders": available_riders,
    }


@router.get("/export/orders")
def export_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher),
    company: Company = Depends(get_current_company)
):
    check_csv_export(db, company.id) 
    orders = db.query(Order).filter(
        Order.company_id == company.id
    ).order_by(Order.created_at.desc()).all()
    csv_content = generate_orders_csv(db, orders)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders.csv"}
    )


@router.get("/export/cod")
def export_cod(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher),
    company: Company = Depends(get_current_company)
):
    
    check_csv_export(db, company.id) 
    payments = db.query(Payment).filter(
        Payment.company_id == company.id,
        Payment.method == "cod"
    ).all()
    csv_content = generate_cod_csv(db, payments)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cod_payments.csv"}
    )



