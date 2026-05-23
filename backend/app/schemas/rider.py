from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserOut
from app.schemas.zone import ZoneOut
from pydantic import ConfigDict


class RiderBase(BaseModel):
    license_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    zone_id: Optional[int] = None


class RiderCreate(RiderBase):
    user_id: int


class RiderUpdate(BaseModel):
    license_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    zone_id: Optional[int] = None
    is_available: Optional[bool] = None


class RiderOut(RiderBase):
    id: int
    user_id: int
    is_available: bool
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    created_at: datetime
    user: Optional[UserOut] = None
    zone: Optional[ZoneOut] = None

    model_config = ConfigDict(from_attributes=True)