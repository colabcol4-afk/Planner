"""
User profile API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.dependencies import get_current_user
from app.db.supabase import get_supabase_client

router = APIRouter()


class ProfileResponse(BaseModel):
    """Response model for user profile."""
    id: str
    username: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    timezone: str
    onboarding_completed: bool
    preferences: Dict[str, Any]
    created_at: str


class ProfileUpdate(BaseModel):
    """Request model for updating profile."""
    full_name: Optional[str] = None
    timezone: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


@router.get("/me", response_model=ProfileResponse)
async def get_current_profile(
    user: dict = Depends(get_current_user)
):
    """
    Get current user's profile.
    """
    supabase = get_supabase_client()

    response = supabase.table("profiles")\
        .select("*")\
        .eq("id", user["id"])\
        .single()\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    p = response.data
    return ProfileResponse(
        id=p["id"],
        username=p["username"],
        email=p["email"],
        full_name=p.get("full_name"),
        avatar_url=p.get("avatar_url"),
        timezone=p.get("timezone", "UTC"),
        onboarding_completed=p.get("onboarding_completed", False),
        preferences=p.get("preferences", {}),
        created_at=p["created_at"]
    )


@router.patch("/me", response_model=ProfileResponse)
async def update_profile(
    profile: ProfileUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Update current user's profile.
    """
    supabase = get_supabase_client()

    update_data = {}
    if profile.full_name is not None:
        update_data["full_name"] = profile.full_name
    if profile.timezone is not None:
        update_data["timezone"] = profile.timezone
    if profile.preferences is not None:
        update_data["preferences"] = profile.preferences

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    response = supabase.table("profiles")\
        .update(update_data)\
        .eq("id", user["id"])\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    p = response.data[0]
    return ProfileResponse(
        id=p["id"],
        username=p["username"],
        email=p["email"],
        full_name=p.get("full_name"),
        avatar_url=p.get("avatar_url"),
        timezone=p.get("timezone", "UTC"),
        onboarding_completed=p.get("onboarding_completed", False),
        preferences=p.get("preferences", {}),
        created_at=p["created_at"]
    )


@router.post("/onboarding/complete")
async def complete_onboarding(
    user: dict = Depends(get_current_user)
):
    """
    Mark onboarding as complete.
    """
    supabase = get_supabase_client()

    response = supabase.table("profiles")\
        .update({"onboarding_completed": True})\
        .eq("id", user["id"])\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {"success": True, "message": "Onboarding completed"}
