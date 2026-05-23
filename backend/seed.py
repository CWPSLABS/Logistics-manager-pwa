from app.database import SessionLocal
from app.models.company import Company
from app.models.user import User, UserRole
from app.models.rider import Rider
from app.services.auth_service import hash_password

db = SessionLocal()

# Create test company
existing_company = db.query(Company).filter(Company.email == "demo@logigh.com").first()
if existing_company:
    print("Demo company already exists")
    company = existing_company
else:
    company = Company(
        name="LogiGH Demo",
        email="demo@logigh.com",
        phone="0200000000",
        plan="pro",
        is_active=True,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    print(f"Demo company created: {company.name}")

# Create admin
existing_admin = db.query(User).filter(User.email == "admin@logigh.com").first()
if existing_admin:
    print("Admin already exists")
else:
    admin = User(
        company_id=company.id,
        full_name="Admin",
        email="admin@logigh.com",
        phone="0200000001",
        hashed_password=hash_password("admin123"),
        role=UserRole.admin,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print("⚠️  Admin created: admin@logigh.com / admin123 — change password immediately")

# ---- DEV ONLY — remove before production ----
import os
if os.getenv("APP_ENV") == "development":
    existing_rider = db.query(User).filter(User.email == "rider@logigh.com").first()
    if existing_rider:
        print("Test rider already exists")
    else:
        rider_user = User(
            company_id=company.id,
            full_name="Test Rider",
            email="rider@logigh.com",
            phone="0200000002",
            hashed_password=hash_password("rider123"),
            role=UserRole.rider,
            is_active=True,
        )
        db.add(rider_user)
        db.commit()
        db.refresh(rider_user)

        rider_profile = Rider(
            company_id=company.id,
            user_id=rider_user.id,
            vehicle_type="bike",
            license_number="GR-0001-24",
            is_available=True,
        )
        db.add(rider_profile)
        db.commit()
        print("⚠️  Test rider created: rider@logigh.com / rider123 — DEV ONLY")

db.close()