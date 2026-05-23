from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.models.company import Company
from app.schemas.order import OrderCreate, OrderUpdate, OrderOut
from app.services.order_service import (
    create_order, update_order_status,
    get_order_by_tracking, get_orders
)
from app.utils.dependencies import get_current_user, require_dispatcher, get_current_company
from app.services.subscription_service import check_order_limit

router = APIRouter()


@router.post("/", response_model=OrderOut, status_code=201)
def create_new_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher),
    company: Company = Depends(get_current_company)
):
    return create_order(db, order_in, dispatcher_id=current_user.id, company_id=company.id)


@router.get("/", response_model=List[OrderOut])
def list_orders(
    skip: int = 0,
    limit: int = 50,
    status: Optional[OrderStatus] = Query(None),
    zone_id: Optional[int] = Query(None),
    rider_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    return get_orders(
        db, skip=skip, limit=limit,
        status=status, zone_id=zone_id,
        rider_id=rider_id, company_id=company.id
    )


@router.get("/track/{tracking_code}", response_model=OrderOut)
def track_order(tracking_code: str, db: Session = Depends(get_db)):
    order = get_order_by_tracking(db, tracking_code)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.company_id == company.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}", response_model=OrderOut)
def update_order(
    order_id: int,
    order_in: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.company_id == company.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order_in.status and order_in.status != order.status:
        update_order_status(db, order, order_in.status, current_user.id)

    for field, value in order_in.model_dump(exclude_unset=True, exclude={"status"}).items():
        setattr(order, field, value)

    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=204)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher),
    company: Company = Depends(get_current_company)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.company_id == company.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()



@router.post("/", response_model=OrderOut, status_code=201)
def create_new_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dispatcher),
    company: Company = Depends(get_current_company)
):
    check_order_limit(db, company.id)  # add this
    return create_order(db, order_in, dispatcher_id=current_user.id, company_id=company.id)   