"""
Task CRUD API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from app.dependencies import get_current_user
from app.db.supabase import get_supabase_client

router = APIRouter()


class TaskCreate(BaseModel):
    """Request model for creating a task."""
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[str] = None
    priority: Optional[str] = "medium"
    duration_minutes: Optional[int] = None
    tags: Optional[List[str]] = None


class TaskUpdate(BaseModel):
    """Request model for updating a task."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[str] = None
    priority: Optional[str] = None
    duration_minutes: Optional[int] = None
    tags: Optional[List[str]] = None


class TaskResponse(BaseModel):
    """Response model for a task."""
    id: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[str]
    due_time: Optional[str]
    duration_minutes: Optional[int]
    tags: Optional[List[str]]
    source: str
    created_at: str
    updated_at: str


class TaskListResponse(BaseModel):
    """Response model for task list."""
    tasks: List[TaskResponse]
    total: int


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    due_date: Optional[date] = Query(None, description="Filter by due date"),
    search: Optional[str] = Query(None, description="Search in title"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user)
):
    """
    List tasks with optional filters.
    """
    supabase = get_supabase_client()

    query = supabase.table("tasks")\
        .select("*", count="exact")\
        .eq("user_id", user["id"])

    if status:
        if status == "active":
            query = query.in_("status", ["pending", "in_progress"])
        else:
            query = query.eq("status", status)

    if priority:
        query = query.eq("priority", priority)

    if due_date:
        query = query.eq("due_date", due_date.isoformat())

    if search:
        query = query.ilike("title", f"%{search}%")

    query = query.order("due_date", desc=False, nullsfirst=False)\
        .order("created_at", desc=True)\
        .range(offset, offset + limit - 1)

    response = query.execute()

    tasks = [
        TaskResponse(
            id=t["id"],
            title=t["title"],
            description=t.get("description"),
            status=t["status"],
            priority=t["priority"],
            due_date=t.get("due_date"),
            due_time=t.get("due_time"),
            duration_minutes=t.get("duration_minutes"),
            tags=t.get("tags"),
            source=t["source"],
            created_at=t["created_at"],
            updated_at=t["updated_at"]
        )
        for t in (response.data or [])
    ]

    return TaskListResponse(
        tasks=tasks,
        total=response.count or len(tasks)
    )


@router.post("", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    user: dict = Depends(get_current_user)
):
    """
    Create a new task.
    """
    supabase = get_supabase_client()

    task_data = {
        "user_id": user["id"],
        "title": task.title,
        "description": task.description,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "due_time": task.due_time,
        "priority": task.priority or "medium",
        "duration_minutes": task.duration_minutes,
        "tags": task.tags,
        "source": "manual",
        "status": "pending"
    }

    task_data = {k: v for k, v in task_data.items() if v is not None}

    response = supabase.table("tasks").insert(task_data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create task")

    t = response.data[0]
    return TaskResponse(
        id=t["id"],
        title=t["title"],
        description=t.get("description"),
        status=t["status"],
        priority=t["priority"],
        due_date=t.get("due_date"),
        due_time=t.get("due_time"),
        duration_minutes=t.get("duration_minutes"),
        tags=t.get("tags"),
        source=t["source"],
        created_at=t["created_at"],
        updated_at=t["updated_at"]
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Get a specific task by ID.
    """
    supabase = get_supabase_client()

    response = supabase.table("tasks")\
        .select("*")\
        .eq("id", task_id)\
        .eq("user_id", user["id"])\
        .single()\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")

    t = response.data
    return TaskResponse(
        id=t["id"],
        title=t["title"],
        description=t.get("description"),
        status=t["status"],
        priority=t["priority"],
        due_date=t.get("due_date"),
        due_time=t.get("due_time"),
        duration_minutes=t.get("duration_minutes"),
        tags=t.get("tags"),
        source=t["source"],
        created_at=t["created_at"],
        updated_at=t["updated_at"]
    )


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task: TaskUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Update a task.
    """
    supabase = get_supabase_client()

    update_data = {}
    if task.title is not None:
        update_data["title"] = task.title
    if task.description is not None:
        update_data["description"] = task.description
    if task.status is not None:
        update_data["status"] = task.status
        if task.status == "completed":
            from datetime import datetime
            update_data["completed_at"] = datetime.utcnow().isoformat()
    if task.due_date is not None:
        update_data["due_date"] = task.due_date.isoformat()
    if task.due_time is not None:
        update_data["due_time"] = task.due_time
    if task.priority is not None:
        update_data["priority"] = task.priority
    if task.duration_minutes is not None:
        update_data["duration_minutes"] = task.duration_minutes
    if task.tags is not None:
        update_data["tags"] = task.tags

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    response = supabase.table("tasks")\
        .update(update_data)\
        .eq("id", task_id)\
        .eq("user_id", user["id"])\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")

    t = response.data[0]
    return TaskResponse(
        id=t["id"],
        title=t["title"],
        description=t.get("description"),
        status=t["status"],
        priority=t["priority"],
        due_date=t.get("due_date"),
        due_time=t.get("due_time"),
        duration_minutes=t.get("duration_minutes"),
        tags=t.get("tags"),
        source=t["source"],
        created_at=t["created_at"],
        updated_at=t["updated_at"]
    )


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a task.
    """
    supabase = get_supabase_client()

    response = supabase.table("tasks")\
        .delete()\
        .eq("id", task_id)\
        .eq("user_id", user["id"])\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"success": True, "message": "Task deleted"}
