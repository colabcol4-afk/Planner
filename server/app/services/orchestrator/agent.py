"""
AI Orchestrator - Main agent that coordinates LLM calls and tool execution.
"""
from typing import AsyncGenerator, Dict, Any, List, Optional
import json

from app.services.llm.groq_client import GroqLLMClient
from app.services.orchestrator.tool_executor import ToolExecutor
from app.db.supabase import get_supabase_client


class AIOrchestrator:
    """
    Main orchestrator that handles conversation flow, tool execution,
    and context management.
    """

    def __init__(self, llm_client: GroqLLMClient):
        self.llm_client = llm_client
        self.supabase = get_supabase_client()

    async def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """Get user context for personalization."""
        context = {}

        try:
            # Get profile
            profile_response = self.supabase.table("profiles")\
                .select("*")\
                .eq("id", user_id)\
                .single()\
                .execute()

            if profile_response.data:
                context["full_name"] = profile_response.data.get("full_name")
                context["timezone"] = profile_response.data.get("timezone", "UTC")
                context["onboarding_completed"] = profile_response.data.get("onboarding_completed")
                context["preferences"] = profile_response.data.get("preferences", {})

            # Get active routines
            routines_response = self.supabase.table("routines")\
                .select("title, day_type, time_of_day")\
                .eq("user_id", user_id)\
                .eq("is_active", True)\
                .execute()

            if routines_response.data:
                context["routines"] = routines_response.data

        except Exception as e:
            print(f"Error getting user context: {e}")

        return context

    async def get_conversation_history(
        self,
        user_id: str,
        session_id: str,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get recent conversation history."""
        try:
            response = self.supabase.table("conversations")\
                .select("role, content, tool_calls, tool_call_id")\
                .eq("user_id", user_id)\
                .eq("session_id", session_id)\
                .order("created_at", desc=False)\
                .limit(limit)\
                .execute()

            messages = []
            for msg in (response.data or []):
                message = {
                    "role": msg["role"],
                    "content": msg["content"]
                }
                if msg.get("tool_calls"):
                    message["tool_calls"] = msg["tool_calls"]
                if msg.get("tool_call_id"):
                    message["tool_call_id"] = msg["tool_call_id"]
                messages.append(message)

            return messages

        except Exception as e:
            print(f"Error getting conversation history: {e}")
            return []

    async def save_message(
        self,
        user_id: str,
        session_id: str,
        role: str,
        content: str,
        tool_calls: Optional[List] = None,
        tool_call_id: Optional[str] = None
    ):
        """Save a message to conversation history."""
        try:
            data = {
                "user_id": user_id,
                "session_id": session_id,
                "role": role,
                "content": content
            }
            if tool_calls:
                data["tool_calls"] = tool_calls
            if tool_call_id:
                data["tool_call_id"] = tool_call_id

            self.supabase.table("conversations").insert(data).execute()

        except Exception as e:
            print(f"Error saving message: {e}")

    async def process_message(
        self,
        user_id: str,
        session_id: str,
        message: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process a user message and stream the response.
        Handles tool calls automatically.
        """
        # Get context and history
        user_context = await self.get_user_context(user_id)
        conversation_history = await self.get_conversation_history(user_id, session_id)

        # Save user message
        await self.save_message(user_id, session_id, "user", message)

        # Initialize tool executor
        tool_executor = ToolExecutor(user_id)

        # Track state
        accumulated_content = ""
        pending_tool_calls = []
        iteration = 0
        max_iterations = 5  # Prevent infinite tool call loops

        while iteration < max_iterations:
            iteration += 1

            # Stream LLM response
            async for chunk in self.llm_client.chat_stream(
                user_message=message if iteration == 1 else "",
                conversation_history=conversation_history,
                user_context=user_context
            ):
                if chunk["type"] == "content":
                    accumulated_content += chunk["content"]
                    yield {
                        "type": "stream",
                        "content": chunk["content"],
                        "is_final": False
                    }

                elif chunk["type"] == "tool_call":
                    pending_tool_calls.append(chunk)
                    yield {
                        "type": "tool_call",
                        "tool": chunk["name"],
                        "args": chunk["arguments"],
                        "status": "pending"
                    }

                elif chunk["type"] == "done":
                    break

                elif chunk["type"] == "error":
                    yield {
                        "type": "error",
                        "message": chunk.get("error", "An error occurred")
                    }
                    return

            # If no tool calls, we're done
            if not pending_tool_calls:
                break

            # Execute tool calls
            tool_results = []
            for tc in pending_tool_calls:
                yield {
                    "type": "tool_call",
                    "tool": tc["name"],
                    "args": tc["arguments"],
                    "status": "executing"
                }

                result = await tool_executor.execute(tc["name"], tc["arguments"])

                tool_results.append({
                    "tool_call_id": tc["id"],
                    "name": tc["name"],
                    "result": result
                })

                yield {
                    "type": "tool_result",
                    "tool": tc["name"],
                    "success": result.get("success", False),
                    "result": result.get("result") or result.get("error")
                }

            # Save assistant message with tool calls
            await self.save_message(
                user_id, session_id, "assistant", accumulated_content,
                tool_calls=[{
                    "id": tc["id"],
                    "type": "function",
                    "function": {
                        "name": tc["name"],
                        "arguments": json.dumps(tc["arguments"])
                    }
                } for tc in pending_tool_calls]
            )

            # Save tool results
            for tr in tool_results:
                await self.save_message(
                    user_id, session_id, "tool",
                    json.dumps(tr["result"]),
                    tool_call_id=tr["tool_call_id"]
                )

            # Update conversation history for continuation
            conversation_history.append({
                "role": "assistant",
                "content": accumulated_content,
                "tool_calls": [{
                    "id": tc["id"],
                    "type": "function",
                    "function": {
                        "name": tc["name"],
                        "arguments": json.dumps(tc["arguments"])
                    }
                } for tc in pending_tool_calls]
            })

            for tr in tool_results:
                conversation_history.append({
                    "role": "tool",
                    "tool_call_id": tr["tool_call_id"],
                    "content": json.dumps(tr["result"])
                })

            # Reset for next iteration
            accumulated_content = ""
            pending_tool_calls = []

            # Continue conversation after tool execution
            async for chunk in self.llm_client.continue_with_tool_results(
                conversation_history=conversation_history,
                tool_results=tool_results,
                user_context=user_context
            ):
                if chunk["type"] == "content":
                    accumulated_content += chunk["content"]
                    yield {
                        "type": "stream",
                        "content": chunk["content"],
                        "is_final": False
                    }

                elif chunk["type"] == "done":
                    break

        # Save final assistant response
        if accumulated_content:
            await self.save_message(user_id, session_id, "assistant", accumulated_content)

        # Send final marker
        yield {
            "type": "stream",
            "content": "",
            "is_final": True
        }
