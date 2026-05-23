from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth
from app.routers import auth, orders
from app.routers import auth, orders, riders
from app.routers import auth, orders, riders, zones, payments
from app.routers import auth, orders, riders, zones, payments, dashboard, notifications
from app.routers import auth, orders, riders, zones, payments, dashboard, notifications, company
from app.routers import auth, orders, riders, zones, payments, dashboard, notifications, company, subscription


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(riders.router, prefix="/api/v1/riders", tags=["Riders"])
app.include_router(zones.router, prefix="/api/v1/zones", tags=["Zones"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(company.router, prefix="/api/v1/company", tags=["Company"])
app.include_router(subscription.router, prefix="/api/v1/subscription", tags=["Subscription"])



@app.get("/")
def root():
    return {"message": f"{settings.app_name} API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}