"""
Tool schemas for LLM function calling.
These schemas define the tools available to the AI assistant.
"""

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new task for the user. Use this when the user wants to add something to their todo list or schedule an activity.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title or name of the task"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional detailed description of the task"
                    },
                    "due_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Due date in YYYY-MM-DD format"
                    },
                    "due_time": {
                        "type": "string",
                        "description": "Optional due time in HH:MM format (24-hour)"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "urgent"],
                        "description": "Task priority level. Default is 'medium'."
                    },
                    "duration_minutes": {
                        "type": "integer",
                        "minimum": 5,
                        "maximum": 480,
                        "description": "Estimated duration in minutes"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional tags for categorization"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update an existing task. Use this to modify task details, mark as complete, change status, or reschedule.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "The unique ID of the task to update"
                    },
                    "title": {
                        "type": "string",
                        "description": "New title for the task"
                    },
                    "description": {
                        "type": "string",
                        "description": "New description"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["pending", "in_progress", "completed", "cancelled"],
                        "description": "New status. Use 'completed' to mark as done."
                    },
                    "due_date": {
                        "type": "string",
                        "format": "date",
                        "description": "New due date in YYYY-MM-DD format"
                    },
                    "due_time": {
                        "type": "string",
                        "description": "New due time in HH:MM format"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "urgent"],
                        "description": "New priority level"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task permanently. Always ask for confirmation before using this.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "The unique ID of the task to delete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List tasks for the user. Use this to show tasks, check what's scheduled, or find specific tasks before updating them.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["pending", "in_progress", "completed", "cancelled", "all"],
                        "description": "Filter by status. Default shows pending and in_progress."
                    },
                    "date": {
                        "type": "string",
                        "format": "date",
                        "description": "Filter by specific date (YYYY-MM-DD)"
                    },
                    "date_range_start": {
                        "type": "string",
                        "format": "date",
                        "description": "Start of date range filter"
                    },
                    "date_range_end": {
                        "type": "string",
                        "format": "date",
                        "description": "End of date range filter"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "urgent"],
                        "description": "Filter by priority"
                    },
                    "search": {
                        "type": "string",
                        "description": "Search term to filter tasks by title"
                    },
                    "limit": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 50,
                        "description": "Maximum number of tasks to return. Default is 20."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_routine",
            "description": "Create a recurring routine or habit for the user. Use this during onboarding or when user wants to track regular activities.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Name of the routine"
                    },
                    "description": {
                        "type": "string",
                        "description": "Description of the routine"
                    },
                    "day_type": {
                        "type": "string",
                        "enum": ["weekday", "weekend", "both"],
                        "description": "When the routine applies"
                    },
                    "time_of_day": {
                        "type": "string",
                        "enum": ["morning", "afternoon", "evening", "night", "anytime"],
                        "description": "Preferred time of day for this routine"
                    },
                    "start_time": {
                        "type": "string",
                        "description": "Preferred start time in HH:MM format"
                    },
                    "duration_minutes": {
                        "type": "integer",
                        "minimum": 5,
                        "description": "Duration in minutes"
                    },
                    "energy_level": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Energy level required for this routine"
                    }
                },
                "required": ["title", "day_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_schedule",
            "description": "Get the user's schedule for a specific date or date range. Shows tasks and routines.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "format": "date",
                        "description": "Specific date to get schedule for (YYYY-MM-DD)"
                    },
                    "week_of": {
                        "type": "string",
                        "format": "date",
                        "description": "Get schedule for the week containing this date"
                    },
                    "include_completed": {
                        "type": "boolean",
                        "description": "Whether to include completed tasks. Default false."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_context",
            "description": "Get information about the user's routines, preferences, and recent activity. Useful for personalized responses.",
            "parameters": {
                "type": "object",
                "properties": {
                    "include_routines": {
                        "type": "boolean",
                        "description": "Include user's active routines"
                    },
                    "include_recent_tasks": {
                        "type": "boolean",
                        "description": "Include recently completed tasks"
                    },
                    "include_preferences": {
                        "type": "boolean",
                        "description": "Include user preferences and settings"
                    }
                },
                "required": []
            }
        }
    }
]


# Tool name to schema mapping for validation
TOOL_NAME_MAP = {tool["function"]["name"]: tool for tool in TOOL_SCHEMAS}


def get_tool_schema(tool_name: str) -> dict:
    """Get schema for a specific tool."""
    return TOOL_NAME_MAP.get(tool_name)


def validate_tool_arguments(tool_name: str, arguments: dict) -> tuple[bool, str]:
    """
    Validate tool arguments against schema.
    Returns (is_valid, error_message).
    """
    schema = get_tool_schema(tool_name)
    if not schema:
        return False, f"Unknown tool: {tool_name}"

    params = schema["function"]["parameters"]
    required = params.get("required", [])
    properties = params.get("properties", {})

    # Check required fields
    for field in required:
        if field not in arguments:
            return False, f"Missing required field: {field}"

    # Check field types (basic validation)
    for field, value in arguments.items():
        if field not in properties:
            continue  # Allow extra fields

        prop = properties[field]
        expected_type = prop.get("type")

        if expected_type == "string" and not isinstance(value, str):
            return False, f"Field '{field}' must be a string"
        elif expected_type == "integer" and not isinstance(value, int):
            return False, f"Field '{field}' must be an integer"
        elif expected_type == "boolean" and not isinstance(value, bool):
            return False, f"Field '{field}' must be a boolean"
        elif expected_type == "array" and not isinstance(value, list):
            return False, f"Field '{field}' must be an array"

        # Check enum values
        if "enum" in prop and value not in prop["enum"]:
            return False, f"Field '{field}' must be one of: {prop['enum']}"

    return True, ""
