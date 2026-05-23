from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.company import Company
from app.models.user import User, UserRole
from app.schemas.company import CompanyRegister, CompanyOut
from app.services.auth_service import hash_password, create_access_token

router = APIRouter()


@router.post("/register", status_code=201)
def register_company(payload: CompanyRegister, db: Session = Depends(get_db)):
    # Check company email not taken
    existing_company = db.query(Company).filter(
        Company.email == payload.company_email
    ).first()
    if existing_company:
        raise HTTPException(status_code=400, detail="Company email already registered")

    # Check admin email not taken
    existing_user = db.query(User).filter(
        User.email == payload.admin_email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Admin email already registered")

    # Check admin phone not taken
    existing_phone = db.query(User).filter(
        User.phone == payload.admin_phone
    ).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # Create company
    company = Company(
        name=payload.company_name,
        email=payload.company_email,
        phone=payload.company_phone,
        plan="free",
        is_active=True,
    )
    db.add(company)
    db.flush()  # get company.id without committing

    # Create admin user for this company
    admin = User(
        company_id=company.id,
        full_name=payload.admin_name,
        email=payload.admin_email,
        phone=payload.admin_phone,
        hashed_password=hash_password(payload.password),
        role=UserRole.admin,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    db.refresh(company)

    # Auto login after registration
    token = create_access_token(data={
        "sub": str(admin.id),
        "role": admin.role,
        "company_id": company.id,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": admin.id,
            "full_name": admin.full_name,
            "email": admin.email,
            "role": admin.role,
            "company_id": company.id,
        },
        "company": {
            "id": company.id,
            "name": company.name,
            "plan": company.plan,
        }
    }


@router.get("/me", response_model=CompanyOut)
def get_my_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda: None)
):
    pass