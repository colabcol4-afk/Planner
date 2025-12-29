"""
Plans API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from app.dependencies import get_current_user
from app.db.supabase import get_supabase_client

router = APIRouter()


class PlanResponse(BaseModel):
    """Response model for a plan."""
    id: str
    plan_date: str
    plan_type: str
    status: str
    notes: Optional[str]
    generated_at: str
    created_at: str


class PlanWithTasksResponse(BaseModel):
    """Response model for plan with tasks."""
    plan: PlanResponse
    tasks: List[dict]


@router.get("")
async def list_plans(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    plan_type: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    """
    List plans with optional filters.
    """
    supabase = get_supabase_client()

    query = supabase.table("plans")\
        .select("*")\
        .eq("user_id", user["id"])

    if start_date:
        query = query.gte("plan_date", start_date.isoformat())

    if end_date:
        query = query.lte("plan_date", end_date.isoformat())

    if plan_type:
        query = query.eq("plan_type", plan_type)

    query = query.order("plan_date", desc=True)

    response = query.execute()

    return {"plans": response.data or []}


@router.get("/{plan_id}", response_model=PlanWithTasksResponse)
async def get_plan(
    plan_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Get a plan with its tasks.
    """
    supabase = get_supabase_client()

    # Get plan
    plan_response = supabase.table("plans")\
        .select("*")\
        .eq("id", plan_id)\
        .eq("user_id", user["id"])\
        .single()\
        .execute()

    if not plan_response.data:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan = plan_response.data

    # Get tasks for this plan
    tasks_response = supabase.table("tasks")\
        .select("*")\
        .eq("plan_id", plan_id)\
        .order("due_time")\
        .execute()

    return PlanWithTasksResponse(
        plan=PlanResponse(
            id=plan["id"],
            plan_date=plan["plan_date"],
            plan_type=plan["plan_type"],
            status=plan["status"],
            notes=plan.get("notes"),
            generated_at=plan["generated_at"],
            created_at=plan["created_at"]
        ),
        tasks=tasks_response.data or []
    )


class GeneratePlanRequest(BaseModel):
    """Request model for generating a plan."""
    date: date
    plan_type: str = "daily"


@router.post("/generate")
async def generate_plan(
    request: GeneratePlanRequest,
    user: dict = Depends(get_current_user)
):
    """
    Generate a new plan for a date.
    """
    supabase = get_supabase_client()

    # Check if plan already exists
    existing = supabase.table("plans")\
        .select("id")\
        .eq("user_id", user["id"])\
        .eq("plan_date", request.date.isoformat())\
        .eq("plan_type", request.plan_type)\
        .execute()

    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="Plan already exists for this date"
        )

    # Create plan
    plan_data = {
        "user_id": user["id"],
        "plan_date": request.date.isoformat(),
        "plan_type": request.plan_type,
        "status": "active"
    }

    response = supabase.table("plans").insert(plan_data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create plan")

    return {"plan": response.data[0]}
