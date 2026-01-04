"""
WebSocket handler for streaming chat using LangGraph.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, Optional
import json
import uuid
from jose import jwt, JWTError

from app.config import settings
from app.services.langgraph import get_agent

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_json(self, user_id: str, data: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(data)


manager = ConnectionManager()


async def validate_token(token: str) -> Optional[dict]:
    """Validate JWT token and return user info."""
    try:
        # Decode JWT without verification (Supabase handles auth)
        # We just need to extract the user ID
        decoded = jwt.decode(
            token,
            key="",
            options={"verify_signature": False, "verify_aud": False}
        )
        user_id = decoded.get("sub")
        email = decoded.get("email")

        if user_id:
            return {
                "id": user_id,
                "email": email
            }
    except JWTError as e:
        print(f"JWT decode error: {e}")
    except Exception as e:
        print(f"Token validation error: {e}")
    return None


@router.websocket("/stream")
async def chat_websocket(
    websocket: WebSocket,
    token: str = Query(...)
):
    """
    WebSocket endpoint for streaming chat.

    Connect with: ws://localhost:8000/api/v1/chat/stream?token=<jwt_token>

    Client Messages:
    - {"type": "message", "content": "...", "session_id": "..."}
    - {"type": "ping"}

    Server Messages:
    - {"type": "stream", "content": "...", "is_final": false}
    - {"type": "tool_call", "tool": "...", "args": {...}, "status": "..."}
    - {"type": "tool_result", "tool": "...", "success": true, "result": {...}}
    - {"type": "error", "message": "..."}
    - {"type": "pong"}
    """
    user_id = None

    try:
        # Validate token
        user = await validate_token(token)
        if not user:
            await websocket.close(code=4001, reason="Invalid token")
            return

        user_id = user["id"]
        print(f"WebSocket: User {user_id} connecting...")

        await manager.connect(websocket, user_id)
        print(f"WebSocket: User {user_id} connected successfully")

        # Initialize LangGraph agent with error handling
        try:
            agent = get_agent(groq_api_key=settings.groq_api_key)
            print(f"WebSocket: LangGraph agent initialized for user {user_id}")
        except Exception as e:
            print(f"WebSocket: Failed to initialize agent: {e}")
            import traceback
            traceback.print_exc()
            await websocket.send_json({
                "type": "error",
                "message": f"Failed to initialize AI: {str(e)}"
            })
            return

        # Send connection success message
        await websocket.send_json({
            "type": "connected",
            "message": "Successfully connected to chat"
        })

        while True:
            # Receive message with better error handling
            try:
                raw_data = await websocket.receive()

                # Check if connection was closed
                if raw_data.get("type") == "websocket.disconnect":
                    print(f"WebSocket: Client {user_id} disconnected")
                    break

                # Parse JSON data
                if "text" in raw_data:
                    data = json.loads(raw_data["text"])
                elif "bytes" in raw_data:
                    data = json.loads(raw_data["bytes"].decode())
                else:
                    continue

            except json.JSONDecodeError as e:
                print(f"WebSocket: Invalid JSON from {user_id}: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON"
                })
                continue
            except Exception as e:
                print(f"WebSocket: Error receiving message: {e}")
                break

            message_type = data.get("type")
            print(f"WebSocket: Received message type '{message_type}' from {user_id}")

            # Handle ping
            if message_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            # Handle chat message
            if message_type == "message":
                content = data.get("content", "").strip()
                if not content:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Empty message"
                    })
                    continue

                session_id = data.get("session_id") or str(uuid.uuid4())
                print(f"WebSocket: Processing message from {user_id}: {content[:50]}...")

                # Process message and stream response using LangGraph
                try:
                    async for chunk in agent.process_message_stream(
                        user_id=user_id,
                        session_id=session_id,
                        message=content
                    ):
                        await websocket.send_json(chunk)

                except Exception as e:
                    print(f"WebSocket: Error processing message: {e}")
                    import traceback
                    traceback.print_exc()
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Failed to process message: {str(e)}"
                    })

            else:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                })

    except WebSocketDisconnect:
        print(f"WebSocket: User {user_id} disconnected (WebSocketDisconnect)")
    except Exception as e:
        print(f"WebSocket: Unexpected error for user {user_id}: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if user_id:
            manager.disconnect(user_id)
            print(f"WebSocket: Cleaned up connection for user {user_id}")
