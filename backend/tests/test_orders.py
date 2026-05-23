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


def get_auth_token():
    client.post("/api/v1/auth/register", json={
        "full_name": "Test Dispatcher",
        "email": "dispatcher@test.com",
        "phone": "0241234567",
        "password": "testpass123",
        "role": "dispatcher"
    })
    response = client.post("/api/v1/auth/login", data={
        "username": "dispatcher@test.com",
        "password": "testpass123"
    })
    return response.json()["access_token"]


def test_create_order():
    token = get_auth_token()
    response = client.post("/api/v1/orders/", json={
        "customer_name": "Kwame Mensah",
        "customer_phone": "0241234567",
        "delivery_address": "123 Accra Mall Road",
        "amount": 50.0,
        "payment_method": "cod",
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["customer_name"] == "Kwame Mensah"
    assert data["tracking_code"].startswith("LGS-")


def test_list_orders():
    token = get_auth_token()
    response = client.get(
        "/api/v1/orders/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_track_order():
    token = get_auth_token()
    create = client.post("/api/v1/orders/", json={
        "customer_name": "Ama Owusu",
        "customer_phone": "0209876543",
        "delivery_address": "Tema Community 5",
        "amount": 30.0,
        "payment_method": "momo",
    }, headers={"Authorization": f"Bearer {token}"})
    tracking_code = create.json()["tracking_code"]
    response = client.get(f"/api/v1/orders/track/{tracking_code}")
    assert response.status_code == 200
    assert response.json()["tracking_code"] == tracking_code