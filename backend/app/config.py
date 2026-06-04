from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./leads.db"
    hubspot_access_token: str = ""
    hubspot_portal_id: str = ""
    cors_origin: str = "http://localhost:3000"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    lead_retention_hours: int = 24
    lead_retention_poll_seconds: int = 900
    lead_retention_enabled: bool = True

    model_config = {
        "env_file": "../.env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",  # .env is shared with frontend-only vars
    }


settings = Settings()
