"""
LangGraph tools for task and routine management.
All tools are decorated with @tool and accessible to the LLM agent.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, date, timedelta
from langchain_core.tools import tool

from app.db.supabase import get_supabase_client


# Global helper for activity logging
async def _log_activity(
    user_id: str,
    action_type: str,
    task_id: Optional[str] = None,
    raw_text: Optional[str] = None
):
    """Log an activity (non-blocking)."""
    try:
        supabase = get_supabase_client()
        supabase.table("activity_logs").insert({
            "user_id": user_id,
            "task_id": task_id,
            "action_type": action_type,
            "source": "conversation",
            "raw_text": raw_text
        }).execute()
    except Exception:
        pass  # Don't fail main operation if logging fails


@tool
async def create_task(
    title: str,
    user_id: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    due_time: Optional[str] = None,
    priority: str = "medium",
    duration_minutes: Optional[int] = None,
    tags: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Create a new task for the user.

    Args:
        title: Task title (required)
        user_id: User ID (injected automatically)
        description: Detailed description of the task
        due_date: Due date in YYYY-MM-DD format
        due_time: Due time in HH:MM format (24-hour)
        priority: Task priority - low, medium, high, or urgent (default: medium)
        duration_minutes: Estimated duration in minutes
        tags: List of tags for categorization

    Returns:
        Dict with task_id, title, due_date, priority, and success message
    """
    supabase = get_supabase_client()

    task_data = {
        "user_id": user_id,
        "title": title,
        "description": description,
        "due_date": due_date,
        "due_time": due_time,
        "priority": priority,
        "duration_minutes": duration_minutes,
        "tags": tags,
        "source": "conversation",
        "status": "pending"
    }

    # Remove None values
    task_data = {k: v for k, v in task_data.items() if v is not None}

    response = supabase.table("tasks").insert(task_data).execute()

    if response.data:
        task = response.data[0]
        # Log activity
        await _log_activity(user_id, "task_created", task["id"], title)
        return {
            "task_id": task["id"],
            "title": task["title"],
            "due_date": task.get("due_date"),
            "priority": task.get("priority"),
            "message": f"Task '{task['title']}' created successfully"
        }

    raise Exception("Failed to create task")


@tool
async def update_task(
    task_id: str,
    user_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    due_date: Optional[str] = None,
    due_time: Optional[str] = None,
    priority: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update an existing task.

    Args:
        task_id: UUID of the task to update (required)
        user_id: User ID (injected automatically)
        title: New task title
        description: New description
        status: New status - pending, in_progress, completed, or cancelled
        due_date: New due date in YYYY-MM-DD format
        due_time: New due time in HH:MM format
        priority: New priority - low, medium, high, or urgent

    Returns:
        Dict with updated task information and success message
    """
    supabase = get_supabase_client()

    # Build update data
    update_data = {}
    allowed_fields = ["title", "description", "status", "due_date", "due_time", "priority"]

    args = {
        "title": title,
        "description": description,
        "status": status,
        "due_date": due_date,
        "due_time": due_time,
        "priority": priority
    }

    for field in allowed_fields:
        if args.get(field) is not None:
            update_data[field] = args[field]

    # Handle completion
    if status == "completed":
        update_data["completed_at"] = datetime.utcnow().isoformat()

    if not update_data:
        return {"message": "No fields to update"}

    response = supabase.table("tasks")\
        .update(update_data)\
        .eq("id", task_id)\
        .eq("user_id", user_id)\
        .execute()

    if response.data:
        task = response.data[0]
        await _log_activity(user_id, "task_updated", task_id)
        return {
            "task_id": task["id"],
            "title": task["title"],
            "status": task["status"],
            "message": f"Task '{task['title']}' updated successfully"
        }

    raise Exception("Task not found or update failed")


@tool
async def delete_task(
    task_id: str,
    user_id: str
) -> Dict[str, Any]:
    """
    Delete a task. Use with caution - this action cannot be undone.

    Args:
        task_id: UUID of the task to delete (required)
        user_id: User ID (injected automatically)

    Returns:
        Dict with task_id and confirmation message
    """
    supabase = get_supabase_client()

    # First get the task to confirm it exists
    task_response = supabase.table("tasks")\
        .select("title")\
        .eq("id", task_id)\
        .eq("user_id", user_id)\
        .execute()

    if not task_response.data:
        raise Exception("Task not found")

    task_title = task_response.data[0]["title"]

    # Delete the task
    supabase.table("tasks")\
        .delete()\
        .eq("id", task_id)\
        .eq("user_id", user_id)\
        .execute()

    await _log_activity(user_id, "task_deleted", task_id, task_title)

    return {
        "task_id": task_id,
        "message": f"Task '{task_title}' deleted successfully"
    }


@tool
async def list_tasks(
    user_id: str,
    status: Optional[str] = None,
    date: Optional[str] = None,
    date_range_start: Optional[str] = None,
    date_range_end: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20
) -> Dict[str, Any]:
    """
    List user's tasks with optional filters.

    Args:
        user_id: User ID (injected automatically)
        status: Filter by status - pending, in_progress, completed, cancelled, or all
        date: Filter by specific due date (YYYY-MM-DD)
        date_range_start: Filter tasks from this date onwards (YYYY-MM-DD)
        date_range_end: Filter tasks up to this date (YYYY-MM-DD)
        priority: Filter by priority - low, medium, high, or urgent
        search: Search in task titles (case-insensitive partial match)
        limit: Maximum number of tasks to return (1-50, default: 20)

    Returns:
        Dict with list of tasks and count
    """
    supabase = get_supabase_client()

    query = supabase.table("tasks")\
        .select("*")\
        .eq("user_id", user_id)

    # Apply filters
    if status and status != "all":
        query = query.eq("status", status)
    elif not status:
        # Default: show pending and in_progress
        query = query.in_("status", ["pending", "in_progress"])

    if date:
        query = query.eq("due_date", date)

    if date_range_start:
        query = query.gte("due_date", date_range_start)

    if date_range_end:
        query = query.lte("due_date", date_range_end)

    if priority:
        query = query.eq("priority", priority)

    if search:
        query = query.ilike("title", f"%{search}%")

    # Limit between 1 and 50
    limit = max(1, min(limit, 50))
    query = query.order("due_date", desc=False, nullsfirst=False).limit(limit)

    response = query.execute()

    tasks = response.data or []

    return {
        "tasks": [
            {
                "id": t["id"],
                "title": t["title"],
                "description": t.get("description"),
                "status": t["status"],
                "priority": t["priority"],
                "due_date": t.get("due_date"),
                "due_time": t.get("due_time"),
                "tags": t.get("tags")
            }
            for t in tasks
        ],
        "count": len(tasks)
    }


@tool
async def create_routine(
    title: str,
    day_type: str,
    user_id: str,
    description: Optional[str] = None,
    time_of_day: Optional[str] = None,
    start_time: Optional[str] = None,
    duration_minutes: Optional[int] = None,
    energy_level: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a recurring routine or habit.

    Args:
        title: Routine title (required)
        day_type: When the routine applies - weekday, weekend, or both (required)
        user_id: User ID (injected automatically)
        description: Detailed description of the routine
        time_of_day: General time - morning, afternoon, evening, night, or anytime
        start_time: Specific start time in HH:MM format (24-hour)
        duration_minutes: Expected duration in minutes
        energy_level: Energy requirement - low, medium, or high

    Returns:
        Dict with routine_id, title, day_type, and success message
    """
    supabase = get_supabase_client()

    routine_data = {
        "user_id": user_id,
        "title": title,
        "description": description,
        "day_type": day_type,
        "time_of_day": time_of_day,
        "start_time": start_time,
        "duration_minutes": duration_minutes,
        "energy_level": energy_level,
        "is_active": True
    }

    routine_data = {k: v for k, v in routine_data.items() if v is not None}

    response = supabase.table("routines").insert(routine_data).execute()

    if response.data:
        routine = response.data[0]
        await _log_activity(user_id, "routine_created", None, routine["title"])
        return {
            "routine_id": routine["id"],
            "title": routine["title"],
            "day_type": routine["day_type"],
            "message": f"Routine '{routine['title']}' created successfully"
        }

    raise Exception("Failed to create routine")


@tool
async def get_schedule(
    user_id: str,
    date: Optional[str] = None,
    week_of: Optional[str] = None,
    include_completed: bool = False
) -> Dict[str, Any]:
    """
    Get schedule for a specific date or week, including tasks and routines.

    Args:
        user_id: User ID (injected automatically)
        date: Specific date to view (YYYY-MM-DD). If not provided, defaults to today
        week_of: Get full week starting from this date (YYYY-MM-DD). Overrides 'date' if provided
        include_completed: Whether to include completed tasks (default: False)

    Returns:
        Dict with date_range, list of tasks, and list of routines
    """
    supabase = get_supabase_client()

    if week_of:
        # Calculate week start and end
        d = datetime.strptime(week_of, "%Y-%m-%d").date()
        week_start = d - timedelta(days=d.weekday())
        week_end = week_start + timedelta(days=6)
        date_start = week_start.isoformat()
        date_end = week_end.isoformat()
    elif date:
        date_start = date
        date_end = date
    else:
        # Default to today
        today = datetime.now().date().isoformat()
        date_start = today
        date_end = today

    # Get tasks
    tasks_query = supabase.table("tasks")\
        .select("*")\
        .eq("user_id", user_id)\
        .gte("due_date", date_start)\
        .lte("due_date", date_end)

    if not include_completed:
        tasks_query = tasks_query.neq("status", "completed")

    tasks_response = tasks_query.order("due_date").order("due_time").execute()

    # Get routines
    routines_response = supabase.table("routines")\
        .select("*")\
        .eq("user_id", user_id)\
        .eq("is_active", True)\
        .execute()

    return {
        "date_range": {"start": date_start, "end": date_end},
        "tasks": [
            {
                "id": t["id"],
                "title": t["title"],
                "due_date": t.get("due_date"),
                "due_time": t.get("due_time"),
                "status": t["status"],
                "priority": t["priority"]
            }
            for t in (tasks_response.data or [])
        ],
        "routines": [
            {
                "id": r["id"],
                "title": r["title"],
                "time_of_day": r.get("time_of_day"),
                "day_type": r["day_type"]
            }
            for r in (routines_response.data or [])
        ]
    }


@tool
async def get_user_context(
    user_id: str,
    include_routines: bool = True,
    include_recent_tasks: bool = False,
    include_preferences: bool = True
) -> Dict[str, Any]:
    """
    Get user's context including profile, routines, and preferences.

    Args:
        user_id: User ID (injected automatically)
        include_routines: Whether to include active routines (default: True)
        include_recent_tasks: Whether to include recently completed tasks (default: False)
        include_preferences: Whether to include user preferences (default: True)

    Returns:
        Dict with profile, routines (if requested), and recent_completed tasks (if requested)
    """
    supabase = get_supabase_client()
    result = {}

    # Get profile
    profile_response = supabase.table("profiles")\
        .select("*")\
        .eq("id", user_id)\
        .single()\
        .execute()

    if profile_response.data:
        result["profile"] = {
            "full_name": profile_response.data.get("full_name"),
            "timezone": profile_response.data.get("timezone"),
            "onboarding_completed": profile_response.data.get("onboarding_completed"),
        }

        if include_preferences:
            result["profile"]["preferences"] = profile_response.data.get("preferences")

    if include_routines:
        routines_response = supabase.table("routines")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("is_active", True)\
            .execute()

        result["routines"] = [
            {
                "title": r["title"],
                "day_type": r["day_type"],
                "time_of_day": r.get("time_of_day")
            }
            for r in (routines_response.data or [])
        ]

    if include_recent_tasks:
        recent_response = supabase.table("tasks")\
            .select("title, status, completed_at")\
            .eq("user_id", user_id)\
            .eq("status", "completed")\
            .order("completed_at", desc=True)\
            .limit(5)\
            .execute()

        result["recent_completed"] = recent_response.data or []

    return result


# Export all tools as a list
ALL_TOOLS = [
    create_task,
    update_task,
    delete_task,
    list_tasks,
    create_routine,
    get_schedule,
    get_user_context
]
