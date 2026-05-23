from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.payment import PaymentStatus
from pydantic import ConfigDict


class PaymentBase(BaseModel):
    order_id: int
    amount: float
    method: str
    momo_number: Optional[str] = None
    reference: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    reference: Optional[str] = None
    is_settled: Optional[bool] = None


class PaymentOut(PaymentBase):
    id: int
    status: PaymentStatus
    is_settled: bool
    collected_by: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)