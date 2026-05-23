import uuid
from sqlalchemy.orm import Session
from app.models.order import Order, OrderStatus
from app.models.delivery_log import DeliveryLog
from app.schemas.order import OrderCreate, OrderUpdate


def generate_tracking_code() -> str:
    return "LGS-" + str(uuid.uuid4()).upper()[:8]


def create_order(db: Session, order_in: OrderCreate, dispatcher_id: int, company_id: int) -> Order:
    order = Order(
        company_id=company_id,
        tracking_code=generate_tracking_code(),
        customer_name=order_in.customer_name,
        customer_phone=order_in.customer_phone,
        delivery_address=order_in.delivery_address,
        ghana_post_code=order_in.ghana_post_code,
        landmark=order_in.landmark,
        delivery_lat=order_in.delivery_lat,
        delivery_lng=order_in.delivery_lng,
        zone_id=order_in.zone_id,
        payment_method=order_in.payment_method,
        amount=order_in.amount,
        notes=order_in.notes,
        dispatcher_id=dispatcher_id,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    log = DeliveryLog(
        company_id=company_id,
        order_id=order.id,
        status=OrderStatus.pending,
        note="Order created",
        changed_by=dispatcher_id,
    )
    db.add(log)
    db.commit()

    return order


def update_order_status(
    db: Session,
    order: Order,
    new_status: OrderStatus,
    changed_by: int,
    note: str = None
) -> Order:
    order.status = new_status
    db.add(order)

    log = DeliveryLog(
        company_id=order.company_id,
        order_id=order.id,
        status=new_status,
        note=note,
        changed_by=changed_by,
    )
    db.add(log)
    db.commit()
    db.refresh(order)
    return order


def get_order_by_tracking(db: Session, tracking_code: str) -> Order:
    return db.query(Order).filter(Order.tracking_code == tracking_code).first()


def get_orders(
    db: Session,
    company_id: int,
    skip: int = 0,
    limit: int = 50,
    status: OrderStatus = None,
    zone_id: int = None,
    rider_id: int = None,
):
    query = db.query(Order).filter(Order.company_id == company_id)
    if status:
        query = query.filter(Order.status == status)
    if zone_id:
        query = query.filter(Order.zone_id == zone_id)
    if rider_id:
        query = query.filter(Order.rider_id == rider_id)
    return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()