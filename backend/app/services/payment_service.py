from sqlalchemy.orm import Session
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import PaymentCreate
from fastapi import HTTPException
import httpx
from app.config import get_settings

settings = get_settings()


def create_payment(db: Session, payment_in: PaymentCreate, collected_by: int, company_id: int) -> Payment:
    payment = Payment(
        company_id=company_id,
        order_id=payment_in.order_id,
        amount=payment_in.amount,
        method=payment_in.method,
        momo_number=payment_in.momo_number,
        reference=payment_in.reference,
        collected_by=collected_by,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_unreconciled_cod(db: Session, company_id: int):
    return db.query(Payment).filter(
        Payment.company_id == company_id,
        Payment.method == "cod",
        Payment.is_settled == False,
        Payment.status == PaymentStatus.confirmed
    ).all()


async def verify_paystack_payment(reference: str) -> bool:
    url = f"https://api.paystack.co/transaction/verify/{reference}"
    headers = {"Authorization": f"Bearer {settings.paystack_secret_key}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        data = response.json()
        return data.get("data", {}).get("status") == "success"