from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class OrderStatus(str, enum.Enum):
    pending = "pending"
    assigned = "assigned"
    picked_up = "picked_up"
    in_transit = "in_transit"
    delivered = "delivered"
    failed = "failed"
    rescheduled = "rescheduled"


class PaymentMethod(str, enum.Enum):
    cod = "cod"
    momo = "momo"
    paystack = "paystack"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    tracking_code = Column(String, unique=True, index=True, nullable=False)

    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)

    delivery_address = Column(Text, nullable=False)
    ghana_post_code = Column(String, nullable=True)
    landmark = Column(String, nullable=True)
    delivery_lat = Column(Float, nullable=True)
    delivery_lng = Column(Float, nullable=True)

    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    rider_id = Column(Integer, ForeignKey("riders.id"), nullable=True)
    dispatcher_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.cod)
    amount = Column(Float, nullable=False)
    is_paid = Column(Boolean, default=False)

    pod_photo_url = Column(String, nullable=True)
    pod_signature_url = Column(String, nullable=True)
    failure_reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    company = relationship("Company", back_populates="orders")
    zone = relationship("Zone")
    rider = relationship("Rider", back_populates="orders")
    dispatcher = relationship("User", foreign_keys=[dispatcher_id])
    status_logs = relationship("DeliveryLog", back_populates="order")