import base64
import hashlib
import hmac
import json
import time
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def _build_signed_headers(secret: str, payload: bytes) -> dict[str, str]:
    if secret.startswith("whsec_"):
        secret = secret.split("_", 1)[1]
    key = base64.b64decode(secret)
    msg_id = "msg_test_123"
    timestamp = str(int(time.time()))
    signed = b".".join([msg_id.encode(), timestamp.encode(), payload])
    signature = base64.b64encode(hmac.new(key, signed, hashlib.sha256).digest()).decode()
    return {
        "svix-id": msg_id,
        "svix-timestamp": timestamp,
        "svix-signature": f"v1,{signature}",
        "content-type": "application/json",
    }


@patch("app.api.webhooks.ClerkSyncService")
def test_clerk_webhook_syncs_user(mock_sync_class):
    mock_sync = MagicMock()
    mock_sync.process_webhook.return_value = {"status": "synced", "clerk_id": "user_123"}
    mock_sync_class.return_value = mock_sync

    secret = "whsec_" + base64.b64encode(b"unit-test-secret").decode()
    previous_secret = settings.clerk_webhook_secret
    settings.clerk_webhook_secret = secret

    payload = {
        "type": "user.created",
        "data": {
            "id": "user_123",
            "primary_email_address_id": "idn_1",
            "email_addresses": [{"id": "idn_1", "email_address": "john@example.com"}],
            "first_name": "John",
            "last_name": "Doe",
        },
    }
    payload_bytes = json.dumps(payload).encode("utf-8")
    headers = _build_signed_headers(secret, payload_bytes)

    try:
        response = client.post("/api/v1/webhooks/clerk", content=payload_bytes, headers=headers)
    finally:
        settings.clerk_webhook_secret = previous_secret

    assert response.status_code == 200
    assert response.json()["ok"] is True
    assert response.json()["status"] == "synced"
    mock_sync.process_webhook.assert_called_once()


def test_clerk_webhook_rejects_invalid_signature():
    secret = "whsec_" + base64.b64encode(b"unit-test-secret").decode()
    previous_secret = settings.clerk_webhook_secret
    settings.clerk_webhook_secret = secret

    payload = {"type": "user.created", "data": {"id": "user_123"}}
    payload_bytes = json.dumps(payload).encode("utf-8")
    headers = {
        "svix-id": "msg_test",
        "svix-timestamp": str(int(time.time())),
        "svix-signature": "v1,invalid",
        "content-type": "application/json",
    }

    try:
        response = client.post("/api/v1/webhooks/clerk", content=payload_bytes, headers=headers)
    finally:
        settings.clerk_webhook_secret = previous_secret

    assert response.status_code == 401
