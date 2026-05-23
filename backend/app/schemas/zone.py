from pydantic import BaseModel
from typing import Optional
from pydantic import ConfigDict



class ZoneBase(BaseModel):
    name: str
    region: str
    description: Optional[str] = None


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    description: Optional[str] = None


class ZoneOut(ZoneBase):
    id: int

    model_config = ConfigDict(from_attributes=True)