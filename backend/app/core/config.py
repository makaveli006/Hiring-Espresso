from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str
    clerk_secret_key: str = ""
    clerk_jwks_url: str = ""
    sentry_dsn: str = ""
    cors_origins: str = "http://localhost:5173"

    # Ingestion
    openai_api_key: str = ""
    ingestion_enabled: bool = True
    ingestion_schedule_hours: int = 6
    ingestion_batch_size: int = 50
    ingestion_rate_limit_delay: float = 1.0
    greenhouse_board_tokens: str = ""
    lever_company_slugs: str = ""
    ashby_company_slugs: str = ""

    # Search discovery providers
    exa_api_key: str = ""
    brave_search_api_key: str = ""
    firecrawl_api_key: str = ""
    tavily_api_key: str = ""
    bing_api_key: str = ""
    google_pse_api_key: str = ""
    google_pse_cx: str = ""
    serper_api_key: str = ""
    serpapi_api_key: str = ""
    serpstack_api_key: str = ""
    serply_api_key: str = ""
    searchapi_api_key: str = ""
    kagi_api_key: str = ""
    mojeek_api_key: str = ""
    jina_api_key: str = ""
    perplexity_api_key: str = ""
    ydc_api_key: str = ""
    yandex_user: str = ""
    yandex_api_key: str = ""
    searxng_base_url: str = ""
    yacy_base_url: str = ""
    bocha_api_key: str = ""
    sogou_api_key: str = ""
    search_discovery_enabled: bool = True
    search_discovery_max_urls: int = 200

    # Job quality filtering
    job_min_quality_score: int = 30
    job_max_age_days: int = 90

    # Validation pipeline
    validation_schedule_hours: int = 24
    validation_concurrency: int = 20

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def greenhouse_tokens_list(self) -> list[str]:
        return [t.strip() for t in self.greenhouse_board_tokens.split(",") if t.strip()]

    @property
    def lever_slugs_list(self) -> list[str]:
        return [s.strip() for s in self.lever_company_slugs.split(",") if s.strip()]

    @property
    def ashby_slugs_list(self) -> list[str]:
        return [s.strip() for s in self.ashby_company_slugs.split(",") if s.strip()]


settings = Settings()
