"""
LangGraph agent implementation for Vibe Planner.
Uses StateGraph with ChatGroq model and tool calling.
"""
from typing import Dict, Any, AsyncGenerator, List
from datetime import datetime
import json

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import tools_condition
from langgraph.checkpoint.memory import MemorySaver

from app.config import settings
from app.db.supabase import get_supabase_client
from app.services.langgraph.state import AgentState
from app.services.langgraph.tools import (
    create_task, update_task, delete_task, list_tasks,
    create_routine, get_schedule, get_user_context
)
from app.services.llm.prompts import get_system_prompt


class VibePlannerAgent:
    """
    LangGraph-based agent for Vibe Planner.
    Manages conversation flow with tool calling using StateGraph.
    """

    def __init__(self, groq_api_key: str):
        """Initialize the agent with ChatGroq model and tools."""
        # Initialize ChatGroq model
        self.llm = ChatGroq(
            api_key=groq_api_key,
            model_name=settings.llm_model,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
            streaming=True
        )

        # Define all tools
        self.tools = [
            create_task,
            update_task,
            delete_task,
            list_tasks,
            create_routine,
            get_schedule,
            get_user_context
        ]

        # Bind tools to the model
        self.llm_with_tools = self.llm.bind_tools(self.tools)

        # Create the graph
        self.graph = self._create_graph()
        self.supabase = get_supabase_client()

    def _create_graph(self) -> StateGraph:
        """
        Create the LangGraph StateGraph with agent and tools nodes.

        Graph flow:
        START → agent → [tools_condition] → tools → agent → END
        """
        # Create the graph
        graph = StateGraph(AgentState)

        # Add nodes
        graph.add_node("agent", self._agent_node)
        graph.add_node("tools", self._tools_node)

        # Set entry point
        graph.set_entry_point("agent")

        # Add conditional edges
        # After agent node, check if tools should be called
        graph.add_conditional_edges(
            "agent",
            tools_condition,  # Built-in function that checks for tool calls
        )

        # After tools, return to agent
        graph.add_edge("tools", "agent")

        # Compile with memory checkpointing
        memory = MemorySaver()
        return graph.compile(checkpointer=memory)

    async def _tools_node(self, state: AgentState) -> Dict[str, Any]:
        """
        Custom tools node that injects user_id into tool calls.

        Args:
            state: Current agent state with user_id

        Returns:
            Updated state with tool messages
        """
        user_id = state["user_id"]
        messages = state["messages"]
        last_message = messages[-1]

        if not isinstance(last_message, AIMessage) or not hasattr(last_message, 'tool_calls'):
            return {"messages": []}

        tool_messages = []

        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call.get("args", {})
            tool_call_id = tool_call.get("id", "")

            # Inject user_id into tool arguments
            tool_args["user_id"] = user_id

            # Find the tool function
            tool_func = None
            for tool in self.tools:
                if tool.name == tool_name:
                    tool_func = tool
                    break

            if tool_func:
                try:
                    # Execute the tool
                    result = await tool_func.ainvoke(tool_args)

                    # Create tool message
                    tool_message = ToolMessage(
                        content=json.dumps(result),
                        tool_call_id=tool_call_id,
                        name=tool_name
                    )
                    tool_messages.append(tool_message)

                except Exception as e:
                    # Handle tool execution errors
                    error_message = ToolMessage(
                        content=json.dumps({"error": str(e), "success": False}),
                        tool_call_id=tool_call_id,
                        name=tool_name
                    )
                    tool_messages.append(error_message)

        return {"messages": tool_messages}

    async def _agent_node(self, state: AgentState) -> Dict[str, Any]:
        """
        Agent node that invokes the LLM with system prompt and conversation history.

        Args:
            state: Current agent state with messages and user context

        Returns:
            Updated state with new AI message
        """
        # Get user context
        user_context = state.get("user_context", {})
        current_date = datetime.now().strftime("%Y-%m-%d")
        current_time = datetime.now().strftime("%H:%M")

        # Build system message
        system_prompt = get_system_prompt(
            user_context=user_context,
            current_date=current_date,
            current_time=current_time
        )

        # Prepare messages with system prompt
        messages = [SystemMessage(content=system_prompt)] + state["messages"]

        # Invoke LLM with tools
        response = await self.llm_with_tools.ainvoke(messages)

        # Return updated state
        return {"messages": [response]}

    async def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """
        Fetch user context from database.

        Args:
            user_id: User's ID

        Returns:
            Dict with user profile, preferences, and routines
        """
        # Get profile
        profile_response = self.supabase.table("profiles")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()

        user_context = {}
        if profile_response.data:
            user_context = {
                "full_name": profile_response.data.get("full_name"),
                "timezone": profile_response.data.get("timezone", "UTC"),
                "onboarding_completed": profile_response.data.get("onboarding_completed"),
                "preferences": profile_response.data.get("preferences", {})
            }

        # Get active routines
        routines_response = self.supabase.table("routines")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("is_active", True)\
            .execute()

        user_context["routines"] = routines_response.data or []

        return user_context

    async def get_conversation_history(
        self,
        user_id: str,
        session_id: str,
        limit: int = 20
    ) -> List[Any]:
        """
        Fetch conversation history from database.

        Args:
            user_id: User's ID
            session_id: Conversation session ID
            limit: Maximum number of messages to retrieve

        Returns:
            List of LangChain message objects
        """
        response = self.supabase.table("conversations")\
            .select("role, content, tool_calls, tool_call_id")\
            .eq("user_id", user_id)\
            .eq("session_id", session_id)\
            .order("created_at")\
            .limit(limit)\
            .execute()

        messages = []
        for msg in (response.data or []):
            role = msg["role"]
            content = msg["content"]

            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                if msg.get("tool_calls"):
                    # AI message with tool calls
                    messages.append(AIMessage(
                        content=content,
                        tool_calls=msg["tool_calls"]
                    ))
                else:
                    messages.append(AIMessage(content=content))
            elif role == "tool":
                messages.append(ToolMessage(
                    content=content,
                    tool_call_id=msg.get("tool_call_id", "")
                ))

        return messages

    async def save_message(
        self,
        user_id: str,
        session_id: str,
        message: Any
    ):
        """
        Save a message to the database.

        Args:
            user_id: User's ID
            session_id: Conversation session ID
            message: LangChain message object
        """
        role = "user"
        if isinstance(message, AIMessage):
            role = "assistant"
        elif isinstance(message, ToolMessage):
            role = "tool"

        message_data = {
            "user_id": user_id,
            "session_id": session_id,
            "role": role,
            "content": message.content if hasattr(message, 'content') else str(message),
            "created_at": datetime.utcnow().isoformat()
        }

        # Add tool call data if present
        if isinstance(message, AIMessage) and hasattr(message, 'tool_calls') and message.tool_calls:
            message_data["tool_calls"] = message.tool_calls

        if isinstance(message, ToolMessage) and hasattr(message, 'tool_call_id'):
            message_data["tool_call_id"] = message.tool_call_id

        self.supabase.table("conversations").insert(message_data).execute()

    async def process_message_stream(
        self,
        user_id: str,
        session_id: str,
        message: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process a user message with streaming response.

        Args:
            user_id: User's ID
            session_id: Conversation session ID
            message: User's message text

        Yields:
            Dict chunks with type and content for WebSocket streaming
        """
        # Get user context
        user_context = await self.get_user_context(user_id)

        # Get conversation history
        history = await self.get_conversation_history(user_id, session_id)

        # Create new user message
        user_message = HumanMessage(content=message)

        # Save user message
        await self.save_message(user_id, session_id, user_message)

        # Prepare initial state
        initial_state = {
            "messages": history + [user_message],
            "user_id": user_id,
            "session_id": session_id,
            "user_context": user_context
        }

        # Stream the graph execution
        config = {"configurable": {"thread_id": session_id}}

        async for event in self.graph.astream(initial_state, config):
            # Event structure: {node_name: {state_updates}}
            for node_name, state_update in event.items():
                if node_name == "agent":
                    # Agent node produced a response
                    messages = state_update.get("messages", [])
                    if messages:
                        last_message = messages[-1]

                        if isinstance(last_message, AIMessage):
                            # Check if there are tool calls
                            if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
                                # Yield tool call notifications
                                for tool_call in last_message.tool_calls:
                                    yield {
                                        "type": "tool_call",
                                        "tool": tool_call["name"],
                                        "args": tool_call.get("args", {}),
                                        "status": "executing"
                                    }

                            # Stream content if available
                            if last_message.content:
                                yield {
                                    "type": "stream",
                                    "content": last_message.content,
                                    "is_final": False
                                }

                            # Save AI message
                            await self.save_message(user_id, session_id, last_message)

                elif node_name == "tools":
                    # Tools node executed
                    messages = state_update.get("messages", [])
                    if messages:
                        for msg in messages:
                            if isinstance(msg, ToolMessage):
                                # Parse tool result
                                try:
                                    result = json.loads(msg.content)
                                    yield {
                                        "type": "tool_result",
                                        "tool": msg.name if hasattr(msg, 'name') else "unknown",
                                        "success": True,
                                        "result": result
                                    }
                                except json.JSONDecodeError:
                                    yield {
                                        "type": "tool_result",
                                        "tool": msg.name if hasattr(msg, 'name') else "unknown",
                                        "success": True,
                                        "result": {"message": msg.content}
                                    }

                                # Save tool message
                                await self.save_message(user_id, session_id, msg)

        # Final marker
        yield {"type": "stream", "content": "", "is_final": True}

    async def process_message(
        self,
        user_id: str,
        session_id: str,
        message: str
    ) -> Dict[str, Any]:
        """
        Process a user message without streaming (for REST API).

        Args:
            user_id: User's ID
            session_id: Conversation session ID
            message: User's message text

        Returns:
            Dict with content, tool_calls, and session_id
        """
        # Get user context
        user_context = await self.get_user_context(user_id)

        # Get conversation history
        history = await self.get_conversation_history(user_id, session_id)

        # Create new user message
        user_message = HumanMessage(content=message)

        # Save user message
        await self.save_message(user_id, session_id, user_message)

        # Prepare initial state
        initial_state = {
            "messages": history + [user_message],
            "user_id": user_id,
            "session_id": session_id,
            "user_context": user_context
        }

        # Invoke the graph
        config = {"configurable": {"thread_id": session_id}}
        final_state = await self.graph.ainvoke(initial_state, config)

        # Extract final response
        final_messages = final_state.get("messages", [])
        if final_messages:
            last_message = final_messages[-1]
            if isinstance(last_message, AIMessage):
                # Save final message
                await self.save_message(user_id, session_id, last_message)

                return {
                    "content": last_message.content,
                    "tool_calls": getattr(last_message, 'tool_calls', []),
                    "session_id": session_id
                }

        return {
            "content": "I'm sorry, I couldn't process that request.",
            "tool_calls": [],
            "session_id": session_id
        }


def get_agent(groq_api_key: str = None) -> VibePlannerAgent:
    """
    Factory function to create a VibePlannerAgent instance.

    Args:
        groq_api_key: Groq API key (defaults to settings if not provided)

    Returns:
        Configured VibePlannerAgent instance
    """
    api_key = groq_api_key or settings.groq_api_key
    return VibePlannerAgent(api_key)
