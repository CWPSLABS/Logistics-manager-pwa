import csv
import io
from sqlalchemy.orm import Session
from app.models.order import Order, OrderStatus
from app.models.payment import Payment


def generate_orders_csv(db: Session, orders: list) -> str:
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Tracking Code", "Customer Name", "Customer Phone",
        "Delivery Address", "Ghana Post Code", "Landmark",
        "Zone", "Rider", "Status", "Payment Method",
        "Amount", "Is Paid", "Created At", "Delivered At"
    ])

    for order in orders:
        writer.writerow([
            order.tracking_code,
            order.customer_name,
            order.customer_phone,
            order.delivery_address,
            order.ghana_post_code or "",
            order.landmark or "",
            order.zone_id or "",
            order.rider_id or "",
            order.status,
            order.payment_method,
            order.amount,
            order.is_paid,
            order.created_at,
            order.delivered_at or "",
        ])

    return output.getvalue()


def generate_cod_csv(db: Session, payments: list) -> str:
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Payment ID", "Order ID", "Amount", "Method",
        "Status", "MoMo Number", "Reference",
        "Is Settled", "Collected By", "Created At"
    ])

    for payment in payments:
        writer.writerow([
            payment.id,
            payment.order_id,
            payment.amount,
            payment.method,
            payment.status,
            payment.momo_number or "",
            payment.reference or "",
            payment.is_settled,
            payment.collected_by or "",
            payment.created_at,
        ])

    return output.getvalue()