from datetime import datetime
from pydantic import BaseModel


class UserOut(BaseModel):
    id: str
    clerk_id: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}
