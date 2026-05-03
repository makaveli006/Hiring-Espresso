import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.webhook_security import verify_svix_request
from app.services.clerk_sync_service import ClerkSyncService

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/clerk")
async def clerk_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    if not settings.clerk_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CLERK_WEBHOOK_SECRET is not configured",
        )

    payload = await request.body()
    try:
        verify_svix_request(
            headers=request.headers,
            payload=payload,
            signing_secret=settings.clerk_webhook_secret,
            tolerance_seconds=settings.clerk_webhook_tolerance_seconds,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        ) from e

    try:
        event = json.loads(payload.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook JSON payload",
        ) from e

    event_type = event.get("type")
    payload_data = event.get("data")
    if not isinstance(event_type, str) or not isinstance(payload_data, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook payload missing type/data",
        )

    try:
        result = ClerkSyncService(db).process_webhook(event_type=event_type, payload_data=payload_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from e

    return {"ok": True, **result}
