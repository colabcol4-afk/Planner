"""
FastAPI dependency injection.
"""
from fastapi import Depends, HTTPException, status, Header
from typing import Optional
from jose import jwt, JWTError

from app.config import settings
from app.db.supabase import get_supabase_client
from app.services.llm.groq_client import GroqLLMClient
from app.services.orchestrator.agent import AIOrchestrator


async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Validate JWT token and return user info.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )

    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

    # Verify token with Supabase
    supabase = get_supabase_client()

    try:
        # Get user from token
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

        return {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "token": token
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}"
        )


def get_llm_client() -> GroqLLMClient:
    """Get Groq LLM client instance."""
    return GroqLLMClient(api_key=settings.groq_api_key)


def get_orchestrator(
    llm_client: GroqLLMClient = Depends(get_llm_client)
) -> AIOrchestrator:
    """Get AI orchestrator instance."""
    return AIOrchestrator(llm_client=llm_client)
