# LangGraph Migration Guide

## Overview

Your backend has been successfully migrated from a custom orchestrator implementation to **LangGraph**, a powerful framework for building stateful, multi-agent AI workflows. This migration uses **ChatGroq** with Groq's fast inference and maintains all existing functionality while providing better structure and maintainability.

---

## What Changed

### 1. **Dependencies** (`requirements.txt`)

**Removed:**
```
groq>=0.14.0  # Raw Groq client
```

**Added:**
```
langchain-groq>=0.2.0       # ChatGroq model for LangChain
langgraph>=0.2.53           # StateGraph framework
langchain-core>=0.3.0       # Core LangChain components
langchain-community>=0.3.0  # Community integrations
langgraph-checkpoint>=2.0.6 # Conversation memory/checkpointing
```

### 2. **New LangGraph Service Module**

Created `server/app/services/langgraph/` with the following files:

#### **`tools.py`** - Tool Definitions
All 7 tools converted to use `@tool` decorator:
- `create_task` - Create new tasks
- `update_task` - Modify existing tasks
- `delete_task` - Remove tasks
- `list_tasks` - Query tasks with filters
- `create_routine` - Add recurring routines
- `get_schedule` - View schedule for dates/weeks
- `get_user_context` - Get user profile and preferences

**Key Pattern:**
```python
from langchain_core.tools import tool

@tool
async def create_task(
    title: str,
    user_id: str,
    description: Optional[str] = None,
    # ... more params
) -> Dict[str, Any]:
    """
    Create a new task for the user.

    Args:
        title: Task title (required)
        user_id: User ID (injected automatically)
        ...
    """
    # Implementation
```

#### **`state.py`** - State Definition
Defines the agent state extending LangGraph's `MessagesState`:
```python
from langgraph.graph import MessagesState

class AgentState(MessagesState):
    user_id: str          # Current user
    session_id: str       # Conversation session
    user_context: dict    # Profile, routines, preferences
```

#### **`agent.py`** - Main LangGraph Agent
The `VibePlannerAgent` class implements:
- **StateGraph** with agent and tools nodes
- **ChatGroq** model with tool binding
- **Custom tools node** that injects `user_id` into tool calls
- **Streaming support** via `process_message_stream()`
- **Non-streaming support** via `process_message()`
- **Conversation persistence** to Supabase
- **Memory checkpointing** for conversation continuity

**Graph Flow:**
```
START → agent → [tools_condition] → tools → agent → END
              ↓ (no tools)
              END
```

### 3. **Updated Files**

#### **`websocket/chat_ws.py`**
```python
# Before
from app.services.orchestrator.agent import AIOrchestrator
orchestrator = AIOrchestrator(llm_client=llm_client)
async for chunk in orchestrator.process_message(...):

# After
from app.services.langgraph import get_agent
agent = get_agent(groq_api_key=settings.groq_api_key)
async for chunk in agent.process_message_stream(...):
```

#### **`routes/chat.py`**
```python
# Before
orchestrator: AIOrchestrator = Depends(get_orchestrator)
async for chunk in orchestrator.process_message(...):

# After
agent: VibePlannerAgent = Depends(get_agent)
result = await agent.process_message(...)
```

#### **`dependencies.py`**
```python
# Before
def get_orchestrator(...) -> AIOrchestrator:
    return AIOrchestrator(llm_client=llm_client)

# After
def get_agent() -> VibePlannerAgent:
    return create_agent(groq_api_key=settings.groq_api_key)
```

---

## Architecture Comparison

### **Before (Custom Orchestrator)**
```
User Message
    ↓
AIOrchestrator
    ↓
GroqLLMClient (raw streaming)
    ↓
ToolExecutor (manual routing)
    ↓
Database Operations
    ↓
Manual response continuation
```

### **After (LangGraph)**
```
User Message
    ↓
VibePlannerAgent (StateGraph)
    ↓
ChatGroq (LangChain model)
    ↓
Built-in tool calling
    ↓
Custom tools node (auto user_id injection)
    ↓
Database Operations
    ↓
Automatic state management & continuation
```

---

## Key Improvements

### 1. **Automatic Tool Calling**
LangGraph handles tool call parsing, execution, and result passing automatically. No manual JSON parsing required.

### 2. **State Management**
Built-in state persistence with `MemorySaver` checkpointer maintains conversation context across turns.

### 3. **Better Streaming**
LangGraph's `astream()` provides granular control over streaming events from different nodes.

### 4. **Extensibility**
Easy to add new nodes (e.g., routing, validation, human-in-the-loop) without refactoring the entire flow.

### 5. **Debugging**
LangGraph provides visualization and debugging tools (LangSmith integration ready).

### 6. **Type Safety**
Stronger typing with Pydantic state models and typed message objects.

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

This will install:
- `langchain-groq` - ChatGroq model
- `langgraph` - StateGraph framework
- `langchain-core` - Core components
- `langgraph-checkpoint` - Memory/persistence

### 2. Environment Variables

No changes needed! Your existing `.env` works:
```bash
GROQ_API_KEY=gsk_your-groq-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Start the Server

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python main.py
```

---

## Testing the Migration

### 1. **Test WebSocket Chat**

Connect via WebSocket and send a message:
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/chat/stream?token=YOUR_JWT');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'message',
    content: 'Create a task to buy groceries tomorrow',
    session_id: 'test-session-123'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  // Should see: tool_call, tool_result, stream chunks
};
```

### 2. **Test REST API**

```bash
# Send a chat message
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "List my tasks for today",
    "session_id": "test-session-123"
  }'
```

### 3. **Test Tool Calling**

Try these commands to verify tools work:
- "Create a task to call mom at 5pm today"
- "Show me all my pending tasks"
- "Mark the groceries task as completed"
- "Create a morning routine for weekdays at 7am"
- "What's on my schedule for this week?"

### 4. **Verify Conversation History**

```bash
curl http://localhost:8000/api/v1/chat/history/test-session-123 \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## Message Flow Example

### Input
```json
{
  "type": "message",
  "content": "Add a task to review PRs tomorrow at 2pm",
  "session_id": "abc123"
}
```

### LangGraph Processing

1. **Agent Node**:
   - Receives message with user context
   - ChatGroq generates response with tool call
   - Yields: `{"type": "tool_call", "tool": "create_task", ...}`

2. **Tools Node**:
   - Injects `user_id` into tool arguments
   - Executes `create_task` tool
   - Saves to database
   - Yields: `{"type": "tool_result", "success": true, ...}`

3. **Agent Node (continuation)**:
   - Receives tool result
   - ChatGroq generates final response
   - Yields: `{"type": "stream", "content": "Done! I've added...", "is_final": true}`

### Output Stream
```json
{"type": "tool_call", "tool": "create_task", "args": {...}, "status": "executing"}
{"type": "tool_result", "tool": "create_task", "success": true, "result": {...}}
{"type": "stream", "content": "Done! I've added 'Review PRs' to your schedule for tomorrow at 2:00 PM.", "is_final": false}
{"type": "stream", "content": "", "is_final": true}
```

---

## Debugging Tips

### 1. **Enable LangGraph Debug Logging**

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 2. **Inspect Graph Structure**

```python
agent = get_agent()
print(agent.graph.get_graph().draw_ascii())
```

### 3. **Check Tool Execution**

Add logging in `_tools_node`:
```python
async def _tools_node(self, state: AgentState):
    print(f"Executing tools for user: {state['user_id']}")
    print(f"Tool calls: {last_message.tool_calls}")
    # ...
```

### 4. **Monitor Streaming Events**

```python
async for event in agent.graph.astream(...):
    print(f"Event: {event}")
```

---

## Migration Checklist

- [x] Install LangGraph dependencies
- [x] Create tools with `@tool` decorator
- [x] Define `AgentState` with MessagesState
- [x] Implement `VibePlannerAgent` with StateGraph
- [x] Update WebSocket handler
- [x] Update REST chat routes
- [x] Update dependency injection
- [x] Test tool calling
- [x] Test streaming
- [x] Test conversation persistence

---

## Rollback Plan

If you need to rollback to the old implementation:

1. **Revert dependencies.py**:
   ```python
   from app.services.orchestrator.agent import AIOrchestrator
   def get_orchestrator(...) -> AIOrchestrator:
   ```

2. **Revert chat_ws.py and routes/chat.py**:
   ```python
   from app.services.orchestrator.agent import AIOrchestrator
   ```

3. **Uninstall LangGraph** (optional):
   ```bash
   pip uninstall langgraph langchain-groq langchain-core
   pip install groq>=0.14.0
   ```

---

## Next Steps

### 1. **Add More Nodes**
You can extend the graph with additional nodes:
- **Validation node**: Check user input before processing
- **Routing node**: Route to different tool groups
- **Human-in-the-loop**: Add approval nodes for sensitive actions

### 2. **LangSmith Integration**
Enable tracing and debugging:
```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-key"
```

### 3. **Custom Checkpointer**
Replace `MemorySaver` with `PostgresSaver` for production:
```python
from langgraph.checkpoint.postgres import PostgresSaver
checkpointer = PostgresSaver(connection_string="postgresql://...")
```

### 4. **Add Retrieval Node**
Integrate RAG for context retrieval:
```python
graph.add_node("retrieval", retrieval_node)
graph.add_edge("retrieval", "agent")
```

---

## Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [ChatGroq Documentation](https://python.langchain.com/docs/integrations/chat/groq/)
- [Building AI Agents with LangGraph (2025 Tutorial)](https://jayant017.medium.com/building-a-personalised-ai-agent-with-langgraph-groq-tavily-fastapi-and-streamlit-2e4e215e8ea9)
- [LangGraph StateGraph Guide](https://www.getzep.com/ai-agents/langgraph-tutorial/)
- [Groq with LangGraph](https://medium.com/@chishti055/groq-with-langgraph-22ac376f87e5)

---

## Support

If you encounter any issues:
1. Check logs for errors
2. Verify all dependencies installed correctly
3. Ensure Groq API key is valid
4. Test with simple messages first
5. Check Supabase connection

---

**Migration completed successfully!** 🎉

Your backend now uses LangGraph for a more robust, maintainable, and extensible AI agent architecture.
