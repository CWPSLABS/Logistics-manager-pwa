from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env")

    # App
    app_name: str = "Logistics Manager"
    app_env: str = "development"
    secret_key: str = "changeme"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Database
    database_url: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Paystack
    paystack_secret_key: str = ""
    paystack_public_key: str = ""

    # Arkesel
    arkesel_api_key: str = ""
    arkesel_sender_id: str = "LogiGH"

    # CORS
    frontend_url: str = "http://localhost:3000"


@lru_cache()
def get_settings() -> Settings:
    return Settings()