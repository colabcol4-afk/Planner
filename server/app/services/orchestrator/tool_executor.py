"""
Tool executor for handling LLM tool calls.
"""
from typing import Dict, Any, Optional
from datetime import datetime, date, timedelta
import json

from app.db.supabase import get_supabase_client
from app.services.tools.schemas import validate_tool_arguments


class ToolExecutor:
    """Executes tool calls from the LLM."""

    def __init__(self, user_id: str):
        self.user_id = user_id
        self.supabase = get_supabase_client()

    async def execute(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool call and return the result.
        """
        # Validate arguments
        is_valid, error = validate_tool_arguments(tool_name, arguments)
        if not is_valid:
            return {"success": False, "error": error}

        # Route to appropriate handler
        handlers = {
            "create_task": self._create_task,
            "update_task": self._update_task,
            "delete_task": self._delete_task,
            "list_tasks": self._list_tasks,
            "create_routine": self._create_routine,
            "get_schedule": self._get_schedule,
            "get_user_context": self._get_user_context,
        }

        handler = handlers.get(tool_name)
        if not handler:
            return {"success": False, "error": f"Unknown tool: {tool_name}"}

        try:
            result = await handler(arguments)
            return {"success": True, "result": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _create_task(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new task."""
        task_data = {
            "user_id": self.user_id,
            "title": args["title"],
            "description": args.get("description"),
            "due_date": args.get("due_date"),
            "due_time": args.get("due_time"),
            "priority": args.get("priority", "medium"),
            "duration_minutes": args.get("duration_minutes"),
            "tags": args.get("tags"),
            "source": "conversation",
            "status": "pending"
        }

        # Remove None values
        task_data = {k: v for k, v in task_data.items() if v is not None}

        response = self.supabase.table("tasks").insert(task_data).execute()

        if response.data:
            task = response.data[0]
            # Log activity
            await self._log_activity("task_created", task["id"], args.get("title"))
            return {
                "task_id": task["id"],
                "title": task["title"],
                "due_date": task.get("due_date"),
                "priority": task.get("priority"),
                "message": f"Task '{task['title']}' created successfully"
            }

        raise Exception("Failed to create task")

    async def _update_task(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing task."""
        task_id = args["task_id"]

        # Build update data
        update_data = {}
        allowed_fields = ["title", "description", "status", "due_date", "due_time", "priority"]

        for field in allowed_fields:
            if field in args:
                update_data[field] = args[field]

        # Handle completion
        if args.get("status") == "completed":
            update_data["completed_at"] = datetime.utcnow().isoformat()

        if not update_data:
            return {"message": "No fields to update"}

        response = self.supabase.table("tasks")\
            .update(update_data)\
            .eq("id", task_id)\
            .eq("user_id", self.user_id)\
            .execute()

        if response.data:
            task = response.data[0]
            await self._log_activity("task_updated", task_id)
            return {
                "task_id": task["id"],
                "title": task["title"],
                "status": task["status"],
                "message": f"Task '{task['title']}' updated successfully"
            }

        raise Exception("Task not found or update failed")

    async def _delete_task(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Delete a task."""
        task_id = args["task_id"]

        # First get the task to confirm it exists
        task_response = self.supabase.table("tasks")\
            .select("title")\
            .eq("id", task_id)\
            .eq("user_id", self.user_id)\
            .execute()

        if not task_response.data:
            raise Exception("Task not found")

        task_title = task_response.data[0]["title"]

        # Delete the task
        self.supabase.table("tasks")\
            .delete()\
            .eq("id", task_id)\
            .eq("user_id", self.user_id)\
            .execute()

        await self._log_activity("task_deleted", task_id, task_title)

        return {
            "task_id": task_id,
            "message": f"Task '{task_title}' deleted successfully"
        }

    async def _list_tasks(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """List tasks with filters."""
        query = self.supabase.table("tasks")\
            .select("*")\
            .eq("user_id", self.user_id)

        # Apply filters
        status = args.get("status")
        if status and status != "all":
            query = query.eq("status", status)
        elif not status:
            # Default: show pending and in_progress
            query = query.in_("status", ["pending", "in_progress"])

        if args.get("date"):
            query = query.eq("due_date", args["date"])

        if args.get("date_range_start"):
            query = query.gte("due_date", args["date_range_start"])

        if args.get("date_range_end"):
            query = query.lte("due_date", args["date_range_end"])

        if args.get("priority"):
            query = query.eq("priority", args["priority"])

        if args.get("search"):
            query = query.ilike("title", f"%{args['search']}%")

        limit = args.get("limit", 20)
        query = query.order("due_date", desc=False).limit(limit)

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

    async def _create_routine(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new routine."""
        routine_data = {
            "user_id": self.user_id,
            "title": args["title"],
            "description": args.get("description"),
            "day_type": args["day_type"],
            "time_of_day": args.get("time_of_day"),
            "start_time": args.get("start_time"),
            "duration_minutes": args.get("duration_minutes"),
            "energy_level": args.get("energy_level"),
            "is_active": True
        }

        routine_data = {k: v for k, v in routine_data.items() if v is not None}

        response = self.supabase.table("routines").insert(routine_data).execute()

        if response.data:
            routine = response.data[0]
            await self._log_activity("routine_created", None, routine["title"])
            return {
                "routine_id": routine["id"],
                "title": routine["title"],
                "day_type": routine["day_type"],
                "message": f"Routine '{routine['title']}' created successfully"
            }

        raise Exception("Failed to create routine")

    async def _get_schedule(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Get schedule for a date or week."""
        target_date = args.get("date")
        week_of = args.get("week_of")
        include_completed = args.get("include_completed", False)

        if week_of:
            # Calculate week start and end
            d = datetime.strptime(week_of, "%Y-%m-%d").date()
            week_start = d - timedelta(days=d.weekday())
            week_end = week_start + timedelta(days=6)
            date_start = week_start.isoformat()
            date_end = week_end.isoformat()
        elif target_date:
            date_start = target_date
            date_end = target_date
        else:
            # Default to today
            today = date.today().isoformat()
            date_start = today
            date_end = today

        # Get tasks
        tasks_query = self.supabase.table("tasks")\
            .select("*")\
            .eq("user_id", self.user_id)\
            .gte("due_date", date_start)\
            .lte("due_date", date_end)

        if not include_completed:
            tasks_query = tasks_query.neq("status", "completed")

        tasks_response = tasks_query.order("due_date").order("due_time").execute()

        # Get routines
        routines_response = self.supabase.table("routines")\
            .select("*")\
            .eq("user_id", self.user_id)\
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

    async def _get_user_context(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Get user context information."""
        result = {}

        # Get profile
        profile_response = self.supabase.table("profiles")\
            .select("*")\
            .eq("id", self.user_id)\
            .single()\
            .execute()

        if profile_response.data:
            result["profile"] = {
                "full_name": profile_response.data.get("full_name"),
                "timezone": profile_response.data.get("timezone"),
                "onboarding_completed": profile_response.data.get("onboarding_completed"),
                "preferences": profile_response.data.get("preferences")
            }

        if args.get("include_routines", True):
            routines_response = self.supabase.table("routines")\
                .select("*")\
                .eq("user_id", self.user_id)\
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

        if args.get("include_recent_tasks", False):
            recent_response = self.supabase.table("tasks")\
                .select("title, status, completed_at")\
                .eq("user_id", self.user_id)\
                .eq("status", "completed")\
                .order("completed_at", desc=True)\
                .limit(5)\
                .execute()

            result["recent_completed"] = recent_response.data or []

        return result

    async def _log_activity(
        self,
        action_type: str,
        task_id: Optional[str] = None,
        raw_text: Optional[str] = None
    ):
        """Log an activity."""
        try:
            self.supabase.table("activity_logs").insert({
                "user_id": self.user_id,
                "task_id": task_id,
                "action_type": action_type,
                "source": "conversation",
                "raw_text": raw_text
            }).execute()
        except Exception:
            pass  # Don't fail main operation if logging fails
