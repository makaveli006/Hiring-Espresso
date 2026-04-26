from pydantic import BaseModel


class CompanyOut(BaseModel):
    id: str
    name: str
    logo_url: str | None = None
    ticker: str | None = None
    exchange: str | None = None
    description: str | None = None
    website: str | None = None

    model_config = {"from_attributes": True}
