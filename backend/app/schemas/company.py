
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional


class CompanyRegister(BaseModel):
    company_name: str
    company_email: EmailStr
    company_phone: Optional[str] = None
    admin_name: str
    admin_email: EmailStr
    admin_phone: str
    password: str


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: Optional[str] = None
    plan: str
    is_active: bool
    created_at: datetime