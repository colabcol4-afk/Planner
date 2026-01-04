"""
Chat API routes for non-streaming chat using LangGraph.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid

from app.dependencies import get_current_user, get_agent
from app.services.langgraph import VibePlannerAgent

router = APIRouter()


class ChatMessageRequest(BaseModel):
    """Request model for chat message."""
    message: str
    session_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    """Response model for chat message."""
    response: str
    session_id: str
    tool_calls: List[Dict[str, Any]] = []


@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(
    request: ChatMessageRequest,
    user: dict = Depends(get_current_user),
    agent: VibePlannerAgent = Depends(get_agent)
):
    """
    Send a chat message and get a response (non-streaming).
    Uses LangGraph agent for processing.
    """
    session_id = request.session_id or str(uuid.uuid4())
    user_id = user["id"]

    # Use the non-streaming method for REST API
    try:
        result = await agent.process_message(
            user_id=user_id,
            session_id=session_id,
            message=request.message
        )

        return ChatMessageResponse(
            response=result["content"],
            session_id=result["session_id"],
            tool_calls=result.get("tool_calls", [])
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process message: {str(e)}"
        )


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history."""
    messages: List[Dict[str, Any]]
    session_id: str


@router.get("/history/{session_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    session_id: str,
    user: dict = Depends(get_current_user),
    agent: VibePlannerAgent = Depends(get_agent)
):
    """
    Get conversation history for a session.
    """
    messages = await agent.get_conversation_history(
        user_id=user["id"],
        session_id=session_id,
        limit=50
    )

    # Convert LangChain messages to dicts
    message_dicts = []
    for msg in messages:
        message_dicts.append({
            "role": msg.__class__.__name__.replace("Message", "").lower(),
            "content": msg.content if hasattr(msg, 'content') else str(msg)
        })

    return ConversationHistoryResponse(
        messages=message_dicts,
        session_id=session_id
    )
