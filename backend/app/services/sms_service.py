import httpx
from app.config import get_settings

settings = get_settings()

ARKESEL_URL = "https://sms.arkesel.com/api/v2/sms/send"


async def send_sms(phone: str, message: str) -> bool:
    headers = {"api-key": settings.arkesel_api_key}
    payload = {
        "sender": settings.arkesel_sender_id,
        "message": message,
        "recipients": [phone],
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(ARKESEL_URL, json=payload, headers=headers)
            return response.status_code == 200
    except Exception:
        return False


async def send_order_assigned_sms(phone: str, tracking_code: str) -> bool:
    message = (
        f"Your order {tracking_code} has been assigned to a rider "
        f"and will be delivered soon."
    )
    return await send_sms(phone, message)


async def send_order_delivered_sms(phone: str, tracking_code: str) -> bool:
    message = f"Your order {tracking_code} has been delivered. Thank you!"
    return await send_sms(phone, message)


async def send_order_failed_sms(phone: str, tracking_code: str, reason: str) -> bool:
    message = (
        f"We could not deliver your order {tracking_code}. "
        f"Reason: {reason}. We will contact you to reschedule."
    )
    return await send_sms(phone, message)