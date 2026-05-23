from sqlalchemy.orm import Session
from app.models.rider import Rider
from app.models.order import Order, OrderStatus
from app.models.delivery_log import DeliveryLog
from fastapi import HTTPException


def assign_rider_to_order(
    db: Session,
    order: Order,
    rider_id: int,
    changed_by: int
) -> Order:
    rider = db.query(Rider).filter(Rider.id == rider_id).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    if not rider.is_available:
        raise HTTPException(status_code=400, detail="Rider is not available")

    order.rider_id = rider_id
    order.status = OrderStatus.assigned

    log = DeliveryLog(
        order_id=order.id,
        status=OrderStatus.assigned,
        note=f"Assigned to rider {rider_id}",
        changed_by=changed_by,
    )
    db.add(log)
    db.commit()
    db.refresh(order)
    return order


def get_available_riders_by_zone(db: Session, zone_id: int):
    return db.query(Rider).filter(
        Rider.zone_id == zone_id,
        Rider.is_available == True
    ).all()