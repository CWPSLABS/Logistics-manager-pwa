import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def get_admin_token():
    client.post("/api/v1/auth/register", json={
        "full_name": "Admin User",
        "email": "admin@test.com",
        "phone": "0201234567",
        "password": "adminpass123",
        "role": "admin"
    })
    response = client.post("/api/v1/auth/login", data={
        "username": "admin@test.com",
        "password": "adminpass123"
    })
    return response.json()["access_token"]


def create_test_user(token):
    response = client.post("/api/v1/auth/register", json={
        "full_name": "Test Rider",
        "email": "rider@test.com",
        "phone": "0551234567",
        "password": "riderpass123",
        "role": "rider"
    })
    return response.json()["id"]


def test_create_rider():
    token = get_admin_token()
    user_id = create_test_user(token)
    response = client.post("/api/v1/riders/", json={
        "user_id": user_id,
        "vehicle_type": "bike",
        "license_number": "GR-1234-22",
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    assert response.json()["vehicle_type"] == "bike"


def test_list_riders():
    token = get_admin_token()
    response = client.get(
        "/api/v1/riders/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)