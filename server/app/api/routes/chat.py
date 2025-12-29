"""
Chat API routes for non-streaming chat.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid

from app.dependencies import get_current_user, get_orchestrator
from app.services.orchestrator.agent import AIOrchestrator

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
    orchestrator: AIOrchestrator = Depends(get_orchestrator)
):
    """
    Send a chat message and get a response (non-streaming).
    """
    session_id = request.session_id or str(uuid.uuid4())
    user_id = user["id"]

    # Collect full response
    full_response = ""
    tool_calls = []

    async for chunk in orchestrator.process_message(
        user_id=user_id,
        session_id=session_id,
        message=request.message
    ):
        if chunk["type"] == "stream":
            full_response += chunk.get("content", "")
        elif chunk["type"] == "tool_result":
            tool_calls.append({
                "tool": chunk["tool"],
                "success": chunk["success"],
                "result": chunk["result"]
            })
        elif chunk["type"] == "error":
            raise HTTPException(
                status_code=500,
                detail=chunk.get("message", "An error occurred")
            )

    return ChatMessageResponse(
        response=full_response,
        session_id=session_id,
        tool_calls=tool_calls
    )


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history."""
    messages: List[Dict[str, Any]]
    session_id: str


@router.get("/history/{session_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    session_id: str,
    user: dict = Depends(get_current_user),
    orchestrator: AIOrchestrator = Depends(get_orchestrator)
):
    """
    Get conversation history for a session.
    """
    messages = await orchestrator.get_conversation_history(
        user_id=user["id"],
        session_id=session_id,
        limit=50
    )

    return ConversationHistoryResponse(
        messages=messages,
        session_id=session_id
    )
