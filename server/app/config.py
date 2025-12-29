"""
Application configuration and settings.
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Environment
    environment: str = "development"
    debug: bool = True

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # Groq AI
    groq_api_key: str = ""

    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]

    # Rate Limiting
    rate_limit_per_minute: int = 60

    # LLM Settings
    llm_model: str = "openai/gpt-oss-120b"
    llm_max_tokens: int = 4096
    llm_temperature: float = 0.7
    llm_reasoning_effort: str = "medium"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
