from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.zone import Zone
from app.models.user import User
from app.models.company import Company
from app.schemas.zone import ZoneCreate, ZoneUpdate, ZoneOut
from app.utils.dependencies import get_current_user, require_admin, get_current_company

router = APIRouter()


@router.post("/", response_model=ZoneOut, status_code=201)
def create_zone(
    zone_in: ZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    zone = Zone(
        company_id=company.id,
        name=zone_in.name,
        region=zone_in.region,
        description=zone_in.description,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.get("/", response_model=List[ZoneOut])
def list_zones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    return db.query(Zone).filter(Zone.company_id == company.id).all()


@router.get("/{zone_id}", response_model=ZoneOut)
def get_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company: Company = Depends(get_current_company)
):
    zone = db.query(Zone).filter(
        Zone.id == zone_id,
        Zone.company_id == company.id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@router.patch("/{zone_id}", response_model=ZoneOut)
def update_zone(
    zone_id: int,
    zone_in: ZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    zone = db.query(Zone).filter(
        Zone.id == zone_id,
        Zone.company_id == company.id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    for field, value in zone_in.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)

    db.commit()
    db.refresh(zone)
    return zone


@router.delete("/{zone_id}", status_code=204)
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    company: Company = Depends(get_current_company)
):
    zone = db.query(Zone).filter(
        Zone.id == zone_id,
        Zone.company_id == company.id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()