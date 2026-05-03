from typing import Any

from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository


def _as_non_empty_string(value: Any) -> str | None:
    if isinstance(value, str):
        value = value.strip()
        if value:
            return value
    return None


def extract_primary_email(user_data: dict[str, Any]) -> str | None:
    primary_email_id = _as_non_empty_string(user_data.get("primary_email_address_id"))
    email_addresses = user_data.get("email_addresses")
    if not isinstance(email_addresses, list):
        return None

    if primary_email_id:
        for row in email_addresses:
            if isinstance(row, dict) and row.get("id") == primary_email_id:
                email = _as_non_empty_string(row.get("email_address"))
                if email:
                    return email.lower()

    for row in email_addresses:
        if isinstance(row, dict):
            email = _as_non_empty_string(row.get("email_address"))
            if email:
                return email.lower()
    return None


def extract_display_name(user_data: dict[str, Any]) -> str | None:
    first_name = _as_non_empty_string(user_data.get("first_name"))
    last_name = _as_non_empty_string(user_data.get("last_name"))
    if first_name or last_name:
        return " ".join(part for part in [first_name, last_name] if part)

    username = _as_non_empty_string(user_data.get("username"))
    return username


class ClerkSyncService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def sync_user(self, clerk_id: str, email: str, name: str | None) -> str:
        self.repo.upsert_from_clerk(clerk_id=clerk_id, email=email, name=name, is_active=True)
        return clerk_id

    def sync_user_from_payload(self, user_data: dict[str, Any]) -> str:
        clerk_id = _as_non_empty_string(user_data.get("id"))
        if not clerk_id:
            raise ValueError("Missing Clerk user id")

        email = extract_primary_email(user_data)
        if not email:
            raise ValueError(f"Missing primary email for Clerk user {clerk_id}")

        name = extract_display_name(user_data)
        return self.sync_user(clerk_id=clerk_id, email=email, name=name)

    def deactivate_user(self, clerk_id: str) -> bool:
        return self.repo.deactivate_by_clerk_id(clerk_id=clerk_id)

    def deactivate_user_from_payload(self, user_data: dict[str, Any]) -> bool:
        clerk_id = _as_non_empty_string(user_data.get("id"))
        if not clerk_id:
            raise ValueError("Missing Clerk user id")
        return self.deactivate_user(clerk_id=clerk_id)

    def process_webhook(self, event_type: str, payload_data: dict[str, Any]) -> dict[str, Any]:
        if event_type in {"user.created", "user.updated"}:
            clerk_id = self.sync_user_from_payload(payload_data)
            return {"status": "synced", "clerk_id": clerk_id}

        if event_type == "user.deleted":
            deactivated = self.deactivate_user_from_payload(payload_data)
            return {"status": "deactivated" if deactivated else "missing", "clerk_id": payload_data.get("id")}

        return {"status": "ignored", "event_type": event_type}
