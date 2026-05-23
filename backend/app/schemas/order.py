from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.order import OrderStatus, PaymentMethod
from pydantic import ConfigDict

class OrderBase(BaseModel):
    customer_name: str
    customer_phone: str
    delivery_address: str
    ghana_post_code: Optional[str] = None
    landmark: Optional[str] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    zone_id: Optional[int] = None
    payment_method: PaymentMethod = PaymentMethod.cod
    amount: float
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    rider_id: Optional[int] = None
    zone_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: Optional[str] = None
    ghana_post_code: Optional[str] = None
    landmark: Optional[str] = None
    amount: Optional[float] = None
    pod_photo_url: Optional[str] = None
    pod_signature_url: Optional[str] = None
    failure_reason: Optional[str] = None
    is_paid: Optional[bool] = None
    notes: Optional[str] = None


class OrderOut(OrderBase):
    id: int
    tracking_code: str
    status: OrderStatus
    rider_id: Optional[int] = None
    dispatcher_id: Optional[int] = None
    is_paid: bool
    pod_photo_url: Optional[str] = None
    pod_signature_url: Optional[str] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)