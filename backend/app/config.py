from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://praxia:praxia@localhost:5432/praxia"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # OpenAI
    openai_api_key: str = ""
    openai_budget_limit: float = 15.0

    # Clerk
    clerk_secret_key: str = ""
    clerk_domain: str = ""
    clerk_webhook_secret: str = ""

    # Server
    backend_port: int = 8000
    backend_host: str = "0.0.0.0"
    log_level: str = "INFO"

    # CORS (frontend_url = une origine ; cors_origins = liste optionnelle séparée par des virgules)
    frontend_url: str = "http://localhost:3000"
    cors_origins: str = ""


settings = Settings()
