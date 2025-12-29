"""
Routine CRUD API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List

from app.dependencies import get_current_user
from app.db.supabase import get_supabase_client

router = APIRouter()


class RoutineCreate(BaseModel):
    """Request model for creating a routine."""
    title: str
    description: Optional[str] = None
    day_type: str  # weekday, weekend, both
    time_of_day: Optional[str] = None  # morning, afternoon, evening, night, anytime
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    energy_level: Optional[str] = None  # low, medium, high


class RoutineUpdate(BaseModel):
    """Request model for updating a routine."""
    title: Optional[str] = None
    description: Optional[str] = None
    day_type: Optional[str] = None
    time_of_day: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    energy_level: Optional[str] = None
    is_active: Optional[bool] = None


class RoutineResponse(BaseModel):
    """Response model for a routine."""
    id: str
    title: str
    description: Optional[str]
    day_type: str
    time_of_day: Optional[str]
    start_time: Optional[str]
    end_time: Optional[str]
    duration_minutes: Optional[int]
    energy_level: Optional[str]
    is_active: bool
    created_at: str
    updated_at: str


class RoutineListResponse(BaseModel):
    """Response model for routine list."""
    routines: List[RoutineResponse]
    total: int


@router.get("", response_model=RoutineListResponse)
async def list_routines(
    day_type: Optional[str] = Query(None, description="Filter by day type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    user: dict = Depends(get_current_user)
):
    """
    List routines with optional filters.
    """
    supabase = get_supabase_client()

    query = supabase.table("routines")\
        .select("*", count="exact")\
        .eq("user_id", user["id"])

    if day_type:
        query = query.eq("day_type", day_type)

    if is_active is not None:
        query = query.eq("is_active", is_active)

    query = query.order("created_at", desc=True)

    response = query.execute()

    routines = [
        RoutineResponse(
            id=r["id"],
            title=r["title"],
            description=r.get("description"),
            day_type=r["day_type"],
            time_of_day=r.get("time_of_day"),
            start_time=r.get("start_time"),
            end_time=r.get("end_time"),
            duration_minutes=r.get("duration_minutes"),
            energy_level=r.get("energy_level"),
            is_active=r["is_active"],
            created_at=r["created_at"],
            updated_at=r["updated_at"]
        )
        for r in (response.data or [])
    ]

    return RoutineListResponse(
        routines=routines,
        total=response.count or len(routines)
    )


@router.post("", response_model=RoutineResponse)
async def create_routine(
    routine: RoutineCreate,
    user: dict = Depends(get_current_user)
):
    """
    Create a new routine.
    """
    supabase = get_supabase_client()

    routine_data = {
        "user_id": user["id"],
        "title": routine.title,
        "description": routine.description,
        "day_type": routine.day_type,
        "time_of_day": routine.time_of_day,
        "start_time": routine.start_time,
        "end_time": routine.end_time,
        "duration_minutes": routine.duration_minutes,
        "energy_level": routine.energy_level,
        "is_active": True
    }

    routine_data = {k: v for k, v in routine_data.items() if v is not None}

    response = supabase.table("routines").insert(routine_data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create routine")

    r = response.data[0]
    return RoutineResponse(
        id=r["id"],
        title=r["title"],
        description=r.get("description"),
        day_type=r["day_type"],
        time_of_day=r.get("time_of_day"),
        start_time=r.get("start_time"),
        end_time=r.get("end_time"),
        duration_minutes=r.get("duration_minutes"),
        energy_level=r.get("energy_level"),
        is_active=r["is_active"],
        created_at=r["created_at"],
        updated_at=r["updated_at"]
    )


@router.patch("/{routine_id}", response_model=RoutineResponse)
async def update_routine(
    routine_id: str,
    routine: RoutineUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Update a routine.
    """
    supabase = get_supabase_client()

    update_data = {}
    for field in ["title", "description", "day_type", "time_of_day",
                  "start_time", "end_time", "duration_minutes",
                  "energy_level", "is_active"]:
        value = getattr(routine, field)
        if value is not None:
            update_data[field] = value

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    response = supabase.table("routines")\
        .update(update_data)\
        .eq("id", routine_id)\
        .eq("user_id", user["id"])\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Routine not found")

    r = response.data[0]
    return RoutineResponse(
        id=r["id"],
        title=r["title"],
        description=r.get("description"),
        day_type=r["day_type"],
        time_of_day=r.get("time_of_day"),
        start_time=r.get("start_time"),
        end_time=r.get("end_time"),
        duration_minutes=r.get("duration_minutes"),
        energy_level=r.get("energy_level"),
        is_active=r["is_active"],
        created_at=r["created_at"],
        updated_at=r["updated_at"]
    )


@router.delete("/{routine_id}")
async def delete_routine(
    routine_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a routine.
    """
    supabase = get_supabase_client()

    response = supabase.table("routines")\
        .delete()\
        .eq("id", routine_id)\
        .eq("user_id", user["id"])\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Routine not found")

    return {"success": True, "message": "Routine deleted"}
