from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.rider import Rider
from app.models.order import Order
from app.models.user import User
from app.models.company import Company
from app.schemas.rider import RiderCreate, RiderUpdate, RiderOut
from app.schemas.order import OrderOut
from app.utils.dependencies import get_current_user, require_dispatcher, require_admin, get_current_company
from app.services.assignment_service import assign_rider_to_order, get_available_riders_by_zone

router = APIRouter()


@router.post("/", response_model=RiderOut, status_code=201)
def create_rider(
    rider_in: RiderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    existing = db.query(Rider).filter(Rider.user_id == rider_in.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Rider profile already exists for this user")

    rider = Rider(
        company_id=company.id,
        user_id=rider_in.user_id,
        zone_id=rider_in.zone_id,
        license_number=rider_in.license_number,
        vehicle_type=rider_in.vehicle_type,
    )
    db.add(rider)
    db.commit()
    db.refresh(rider)
    return rider


@router.get("/", response_model=List[RiderOut])
def list_riders(
    zone_id: Optional[int] = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    query = db.query(Rider).filter(Rider.company_id == company.id)
    if zone_id:
        query = query.filter(Rider.zone_id == zone_id)
    if available_only:
        query = query.filter(Rider.is_available == True)
    return query.all()


@router.get("/{rider_id}", response_model=RiderOut)
def get_rider(
    rider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    rider = db.query(Rider).filter(
        Rider.id == rider_id,
        Rider.company_id == company.id
    ).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    return rider


@router.patch("/{rider_id}", response_model=RiderOut)
def update_rider(
    rider_id: int,
    rider_in: RiderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    rider = db.query(Rider).filter(
        Rider.id == rider_id,
        Rider.company_id == company.id
    ).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    for field, value in rider_in.model_dump(exclude_unset=True).items():
        setattr(rider, field, value)

    db.commit()
    db.refresh(rider)
    return rider


@router.patch("/{rider_id}/toggle-availability", response_model=RiderOut)
def toggle_availability(
    rider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    rider = db.query(Rider).filter(
        Rider.id == rider_id,
        Rider.company_id == company.id
    ).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    rider.is_available = not rider.is_available
    db.commit()
    db.refresh(rider)
    return rider


@router.post("/{rider_id}/assign/{order_id}", response_model=OrderOut)
def assign_order(
    rider_id: int,
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
    return assign_rider_to_order(db, order, rider_id, current_user.id)


@router.get("/{rider_id}/orders", response_model=List[OrderOut])
def get_rider_orders(
    rider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    return db.query(Order).filter(
        Order.rider_id == rider_id,
        Order.company_id == company.id
    ).all()


@router.delete("/{rider_id}", status_code=204)
def delete_rider(
    rider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    rider = db.query(Rider).filter(
        Rider.id == rider_id,
        Rider.company_id == company.id
    ).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    db.delete(rider)
    db.commit()
