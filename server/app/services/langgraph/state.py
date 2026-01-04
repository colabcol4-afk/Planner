"""
LangGraph state definition for the Vibe Planner agent.
Extends MessagesState with user context.
"""
from typing import TypedDict, Annotated
from langgraph.graph import MessagesState
from langchain_core.messages import BaseMessage
from operator import add


class AgentState(MessagesState):
    """
    Custom state for Vibe Planner agent.

    Inherits from MessagesState which provides:
    - messages: List[BaseMessage] - Conversation history

    Adds:
    - user_id: str - Current user's ID for database operations
    - session_id: str - Current conversation session ID
    - user_context: dict - User profile, routines, preferences
    """
    user_id: str
    session_id: str
    user_context: dict
