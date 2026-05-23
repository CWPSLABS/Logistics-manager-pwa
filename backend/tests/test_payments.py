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


def get_dispatcher_token():
    client.post("/api/v1/auth/register", json={
        "full_name": "Dispatcher",
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


def create_test_order(token):
    response = client.post("/api/v1/orders/", json={
        "customer_name": "Kofi Boateng",
        "customer_phone": "0271234567",
        "delivery_address": "Spintex Road, Accra",
        "amount": 75.0,
        "payment_method": "cod",
    }, headers={"Authorization": f"Bearer {token}"})
    return response.json()["id"]


def test_record_payment():
    token = get_dispatcher_token()
    order_id = create_test_order(token)
    response = client.post("/api/v1/payments/", json={
        "order_id": order_id,
        "amount": 75.0,
        "method": "cod",
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    assert response.json()["method"] == "cod"


def test_list_payments():
    token = get_dispatcher_token()
    response = client.get(
        "/api/v1/payments/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)