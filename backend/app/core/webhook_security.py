import base64
import hashlib
import hmac
import time
from collections.abc import Mapping


def _get_header(headers: Mapping[str, str], *names: str) -> str | None:
    for name in names:
        value = headers.get(name)
        if value:
            return value
    return None


def _extract_v1_signatures(signature_header: str) -> list[str]:
    signatures: list[str] = []
    for part in signature_header.split():
        version, _, value = part.partition(",")
        if version == "v1" and value:
            signatures.append(value.strip())
    return signatures


def verify_svix_request(
    headers: Mapping[str, str],
    payload: bytes,
    signing_secret: str,
    tolerance_seconds: int = 300,
) -> str:
    msg_id = _get_header(headers, "svix-id", "webhook-id")
    msg_timestamp = _get_header(headers, "svix-timestamp", "webhook-timestamp")
    msg_signature = _get_header(headers, "svix-signature", "webhook-signature")
    if not msg_id or not msg_timestamp or not msg_signature:
        raise ValueError("Missing Svix headers")

    try:
        timestamp = int(msg_timestamp)
    except ValueError as e:
        raise ValueError("Invalid webhook timestamp") from e

    now = int(time.time())
    if abs(now - timestamp) > tolerance_seconds:
        raise ValueError("Webhook timestamp outside tolerance")

    if signing_secret.startswith("whsec_"):
        signing_secret = signing_secret.split("_", 1)[1]

    try:
        padded_secret = signing_secret + "=" * (-len(signing_secret) % 4)
        key = base64.b64decode(padded_secret)
    except Exception as e:
        raise ValueError("Invalid webhook secret format") from e

    signed_content = b".".join([msg_id.encode(), msg_timestamp.encode(), payload])
    expected = base64.b64encode(hmac.new(key, signed_content, hashlib.sha256).digest()).decode()

    for signature in _extract_v1_signatures(msg_signature):
        if hmac.compare_digest(expected, signature):
            return msg_id

    raise ValueError("Webhook signature mismatch")
