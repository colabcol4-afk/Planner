"""
Supabase client configuration.
"""
from supabase import create_client, Client
from functools import lru_cache

from app.config import settings


@lru_cache()
def get_supabase_client() -> Client:
    """Get cached Supabase client instance."""
    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )


def get_supabase_client_with_token(token: str) -> Client:
    """Get Supabase client with user token for RLS."""
    client = create_client(
        settings.supabase_url,
        settings.supabase_anon_key
    )
    client.auth.set_session(token, token)
    return client
