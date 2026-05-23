from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.payment import Payment, PaymentStatus
from app.models.order import Order
from app.models.user import User
from app.models.company import Company
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentOut
from app.services.payment_service import create_payment, get_unreconciled_cod, verify_paystack_payment
from app.utils.dependencies import get_current_user, require_dispatcher, get_current_company

router = APIRouter()


@router.post("/", response_model=PaymentOut, status_code=201)
def record_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    order = db.query(Order).filter(
        Order.id == payment_in.order_id,
        Order.company_id == company.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return create_payment(db, payment_in, collected_by=current_user.id, company_id=company.id)


@router.get("/", response_model=List[PaymentOut])
def list_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher),
    company: Company = Depends(get_current_company)
):
    return db.query(Payment).filter(
        Payment.company_id == company.id
    ).order_by(Payment.created_at.desc()).all()


@router.get("/cod/unreconciled", response_model=List[PaymentOut])
def unreconciled_cod(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher),
    company: Company = Depends(get_current_company)
):
    return db.query(Payment).filter(
        Payment.company_id == company.id,
        Payment.method == "cod",
        Payment.is_settled == False,
        Payment.status == PaymentStatus.confirmed
    ).all()


@router.patch("/{payment_id}", response_model=PaymentOut)
def update_payment(
    payment_id: int,
    payment_in: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher),
    company: Company = Depends(get_current_company)
):
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.company_id == company.id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    for field, value in payment_in.model_dump(exclude_unset=True).items():
        setattr(payment, field, value)

    db.commit()
    db.refresh(payment)
    return payment


@router.post("/verify/paystack/{reference}")
async def verify_paystack(
    reference: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    is_valid = await verify_paystack_payment(reference)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    payment = db.query(Payment).filter(
        Payment.reference == reference,
        Payment.company_id == company.id
    ).first()
    if payment:
        payment.status = PaymentStatus.confirmed
        db.commit()

    return {"status": "verified", "reference": reference}