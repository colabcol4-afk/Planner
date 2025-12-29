# Vibe Planner - Technical Architecture Document

> **Version**: 1.0 | **Last Updated**: December 30, 2024
> **Purpose**: Comprehensive technical guide for developers and LLMs to understand every aspect of this application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Frontend Architecture](#4-frontend-architecture)
   - [Pages & Routes](#41-pages--routes)
   - [Components](#42-components)
   - [Hooks](#43-hooks)
   - [State Management](#44-state-management)
   - [API Client](#45-api-client)
   - [Utilities](#46-utilities)
   - [Types](#47-types)
5. [Backend Architecture](#5-backend-architecture)
   - [Entry Point & Configuration](#51-entry-point--configuration)
   - [API Routes](#52-api-routes)
   - [WebSocket Handler](#53-websocket-handler)
   - [Services](#54-services)
   - [Dependencies](#55-dependencies)
6. [Database Schema](#6-database-schema)
   - [Tables](#61-tables)
   - [Indexes](#62-indexes)
   - [Row Level Security](#63-row-level-security)
   - [Triggers & Functions](#64-triggers--functions)
7. [Authentication Flow](#7-authentication-flow)
8. [AI Chat Flow](#8-ai-chat-flow)
9. [Tool System](#9-tool-system)
10. [Design System](#10-design-system)
11. [Environment Variables](#11-environment-variables)
12. [File Reference Index](#12-file-reference-index)

---

## 1. Project Overview

**Vibe Planner** is an AI-powered conversational planning application that helps users manage tasks, schedules, and routines through natural language interactions.

### Core Features
- **AI Chat Interface**: Real-time streaming chat with GPT-OSS-120B via Groq
- **Task Management**: CRUD operations for tasks with priorities, due dates, tags
- **Routine Tracking**: Define recurring habits for weekdays/weekends
- **Schedule View**: Calendar-based task visualization
- **Tool Calling**: AI can create/update/delete tasks through conversation

### Architecture Pattern
- **Frontend**: Next.js 14 App Router (React Server Components + Client Components)
- **Backend**: FastAPI with async support
- **Database**: PostgreSQL via Supabase with Row Level Security
- **Real-time**: WebSocket for streaming AI responses
- **State**: Zustand for client-side state management

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 11.x | Animations |
| Zustand | 4.x | State management |
| @supabase/ssr | 0.5.x | Supabase client for SSR |
| Lucide React | - | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115.x | Async Python web framework |
| Uvicorn | 0.34.x | ASGI server |
| Groq SDK | 0.14.x+ | LLM API client |
| Supabase | 2.11.x | Database client |
| Pydantic | 2.x | Data validation |
| python-jose | 3.3.x | JWT handling |
| WebSockets | 14.x | Real-time communication |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL database + Auth + Real-time |
| Groq | LLM inference (openai/gpt-oss-120b) |

---

## 3. Directory Structure

```
Planner/
├── client/                              # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                         # App Router (pages & layouts)
│   │   │   ├── (auth)/                  # Auth route group (no layout nesting)
│   │   │   │   ├── callback/
│   │   │   │   │   └── route.ts         # OAuth callback handler
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx         # Login page
│   │   │   │   └── signup/
│   │   │   │       └── page.tsx         # Signup page
│   │   │   ├── (dashboard)/             # Protected dashboard route group
│   │   │   │   ├── chat/
│   │   │   │   │   └── page.tsx         # AI chat interface
│   │   │   │   ├── tasks/
│   │   │   │   │   └── page.tsx         # Task management
│   │   │   │   ├── schedule/
│   │   │   │   │   └── page.tsx         # Calendar view
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx         # User settings
│   │   │   │   └── layout.tsx           # Dashboard layout with sidebar
│   │   │   ├── globals.css              # Global styles & CSS variables
│   │   │   ├── layout.tsx               # Root layout
│   │   │   └── page.tsx                 # Landing page
│   │   ├── components/
│   │   │   ├── chat/                    # Chat-specific components
│   │   │   │   ├── ChatContainer.tsx    # Main chat wrapper
│   │   │   │   ├── ChatInput.tsx        # Message input field
│   │   │   │   ├── MessageBubble.tsx    # Individual message display
│   │   │   │   ├── MessageList.tsx      # Message list container
│   │   │   │   └── TypingIndicator.tsx  # AI typing animation
│   │   │   ├── ui/                      # Reusable UI components
│   │   │   │   ├── Avatar.tsx           # User avatar
│   │   │   │   ├── Button.tsx           # Button variants
│   │   │   │   ├── Card.tsx             # Card container
│   │   │   │   ├── Input.tsx            # Form input
│   │   │   │   ├── Modal.tsx            # Modal dialog
│   │   │   │   ├── Spinner.tsx          # Loading spinner
│   │   │   │   └── Toast.tsx            # Notification toasts
│   │   │   └── providers/
│   │   │       └── Providers.tsx        # Context providers wrapper
│   │   ├── hooks/
│   │   │   └── useChat.ts               # WebSocket chat hook
│   │   ├── lib/
│   │   │   ├── api.ts                   # REST API client
│   │   │   ├── utils.ts                 # Helper functions
│   │   │   └── supabase/
│   │   │       ├── client.ts            # Browser Supabase client
│   │   │       ├── server.ts            # Server Supabase client
│   │   │       └── middleware.ts        # Auth middleware helper
│   │   ├── stores/
│   │   │   └── chatStore.ts             # Zustand chat state
│   │   ├── types/
│   │   │   └── supabase.ts              # Generated database types
│   │   └── middleware.ts                # Next.js middleware
│   ├── public/                          # Static assets
│   ├── .env.local                       # Environment variables
│   ├── .env.local.example               # Example env file
│   ├── next.config.js                   # Next.js configuration
│   ├── tailwind.config.js               # Tailwind configuration
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── postcss.config.js                # PostCSS configuration
│   └── package.json                     # Dependencies
│
├── server/                              # FastAPI Backend Application
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/                  # REST API endpoints
│   │   │   │   ├── chat.py              # Chat endpoints
│   │   │   │   ├── tasks.py             # Task CRUD
│   │   │   │   ├── routines.py          # Routine CRUD
│   │   │   │   ├── plans.py             # Plan management
│   │   │   │   └── users.py             # User profile
│   │   │   └── websocket/
│   │   │       └── chat_ws.py           # WebSocket handler
│   │   ├── db/
│   │   │   └── supabase.py              # Supabase client
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   │   ├── groq_client.py       # Groq API client
│   │   │   │   └── prompts.py           # System prompts
│   │   │   ├── orchestrator/
│   │   │   │   ├── agent.py             # AI orchestrator
│   │   │   │   └── tool_executor.py     # Tool execution
│   │   │   └── tools/
│   │   │       └── schemas.py           # Tool definitions
│   │   ├── __init__.py
│   │   ├── config.py                    # Settings management
│   │   └── dependencies.py              # FastAPI dependencies
│   ├── main.py                          # Application entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── .env                             # Environment variables
│   └── .env.example                     # Example env file
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql       # Database schema
│       └── 002_rls_policies.sql         # Security policies
│
├── .gitignore                           # Git ignore rules
├── CLAUDE.md                            # AI assistant context
├── README.md                            # Project readme
├── prd.md                               # Product requirements
└── design_standards.md                  # Design system specs
```

---

## 4. Frontend Architecture

### 4.1 Pages & Routes

| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/` | `app/page.tsx` | Public | Landing page with hero, features, and CTA |
| `/login` | `app/(auth)/login/page.tsx` | Public | Email/password + Google OAuth login |
| `/signup` | `app/(auth)/signup/page.tsx` | Public | Account registration |
| `/auth/callback` | `app/(auth)/callback/route.ts` | Public | OAuth callback handler |
| `/chat` | `app/(dashboard)/chat/page.tsx` | Protected | AI chat interface |
| `/tasks` | `app/(dashboard)/tasks/page.tsx` | Protected | Task management with CRUD |
| `/schedule` | `app/(dashboard)/schedule/page.tsx` | Protected | Weekly calendar view |
| `/settings` | `app/(dashboard)/settings/page.tsx` | Protected | Profile & preferences |

#### Route Protection Logic
```typescript
// middleware.ts - Protects routes via Supabase session
const protectedRoutes = ['/chat', '/tasks', '/schedule', '/settings'];
const authRoutes = ['/login', '/signup'];

// Unauthenticated → Redirect to /login
// Authenticated on auth routes → Redirect to /chat
```

### 4.2 Components

#### Chat Components (`components/chat/`)

##### ChatContainer.tsx
```typescript
// Main chat interface wrapper
export function ChatContainer(): JSX.Element

// Features:
// - Connection status indicator (green dot = connected)
// - Backend not running warning banner
// - Auto-scroll on new messages
// - Empty state with suggestion buttons
// - Message list with typing indicator
// - Chat input at bottom
```

##### ChatInput.tsx
```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
export function ChatInput(props: ChatInputProps): JSX.Element

// Features:
// - Auto-resizing textarea
// - Enter to send, Shift+Enter for newline
// - Send button with loading state
// - Disabled state when not connected
```

##### MessageBubble.tsx
```typescript
interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}
export function MessageBubble(props: MessageBubbleProps): JSX.Element

// Features:
// - Different styling for user vs assistant
// - Avatar display
// - Timestamp (relative time)
// - Basic markdown rendering (lists, bold)
// - Streaming animation for incomplete messages
```

##### MessageList.tsx
```typescript
interface MessageListProps {
  messages: Message[];
}
export function MessageList(props: MessageListProps): JSX.Element

// Renders array of MessageBubble components with animations
```

##### TypingIndicator.tsx
```typescript
export function TypingIndicator(): JSX.Element

// Animated three-dot typing indicator
// Shows when AI is generating response
```

#### UI Components (`components/ui/`)

##### Button.tsx
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>()

// Variants:
// - primary: Brand gradient background, white text
// - secondary: White background, border
// - ghost: Transparent, text only
// - danger: Red background for destructive actions
```

##### Card.tsx
```typescript
interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}
export function Card(props: CardProps): JSX.Element
export function CardHeader(props): JSX.Element
export function CardTitle(props): JSX.Element
export function CardDescription(props): JSX.Element
export function CardContent(props): JSX.Element
export function CardFooter(props): JSX.Element
```

##### Modal.tsx
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  children: React.ReactNode;
}
export function Modal(props: ModalProps): JSX.Element | null
export function ModalFooter(props): JSX.Element

// Features:
// - Portal rendering to document.body
// - Animated entrance/exit (Framer Motion)
// - Backdrop click to close
// - Escape key to close
// - Focus trap
```

##### Toast.tsx
```typescript
// Singleton toast API
export const toast = {
  success: (title: string, description?: string) => void,
  error: (title: string, description?: string) => void,
  warning: (title: string, description?: string) => void,
  info: (title: string, description?: string) => void,
  dismiss: (id?: string) => void,
}

export function Toaster(): JSX.Element

// Features:
// - Auto-dismiss after 5 seconds
// - Manual dismiss with X button
// - Stacked notifications
// - Color-coded by type
```

##### Input.tsx
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>()
```

##### Avatar.tsx
```typescript
interface AvatarProps {
  src?: string | null;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}
export function Avatar(props: AvatarProps): JSX.Element

// Shows image or fallback initials from name/email
```

##### Spinner.tsx
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export function Spinner(props: SpinnerProps): JSX.Element
```

### 4.3 Hooks

#### useChat.ts
```typescript
interface UseChatOptions {
  onError?: (error: string) => void;
}

interface UseChatReturn {
  messages: Message[];
  sessionId: string;
  isConnected: boolean;
  isTyping: boolean;
  sendMessage: (content: string) => void;
  resetSession: () => void;
  reconnect: () => Promise<void>;
}

export function useChat(options?: UseChatOptions): UseChatReturn
```

**WebSocket Connection Flow:**
1. On mount, get Supabase session token
2. Connect to `ws://localhost:8000/api/v1/chat/stream?token={jwt}`
3. On open: Set connected, start ping interval (25s)
4. On message: Parse JSON, handle by type (stream, tool_call, tool_result, error, pong)
5. On close: Set disconnected, attempt reconnect after 5s (unless code 1000 or 4001)

**Message Protocol:**
```typescript
// Client → Server
{ type: 'message', content: string, session_id: string }
{ type: 'ping' }

// Server → Client
{ type: 'connected', message: string }
{ type: 'stream', content: string, is_final: boolean }
{ type: 'tool_call', tool: string, args: object, status: string }
{ type: 'tool_result', tool: string, success: boolean, result: any }
{ type: 'error', message: string }
{ type: 'pong' }
```

### 4.4 State Management

#### chatStore.ts (Zustand)
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatState {
  messages: Message[];
  sessionId: string;
  isConnected: boolean;
  isTyping: boolean;
}

interface ChatActions {
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  appendToMessage: (id: string, content: string) => void;
  setSessionId: (id: string) => void;
  setIsConnected: (connected: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  clearMessages: () => void;
  resetSession: () => void;
}

export const useChatStore = create<ChatState & ChatActions>()
```

### 4.5 API Client

#### api.ts
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL; // http://localhost:8000

export const api = {
  // Chat
  chat: {
    sendMessage: (content: string, sessionId?: string) => Promise<ChatResponse>,
    getHistory: (sessionId: string) => Promise<Message[]>,
  },

  // Tasks
  tasks: {
    list: (filters?: TaskFilters) => Promise<Task[]>,
    create: (data: CreateTaskData) => Promise<Task>,
    update: (id: string, data: UpdateTaskData) => Promise<Task>,
    delete: (id: string) => Promise<void>,
    get: (id: string) => Promise<Task>,
  },

  // Routines
  routines: {
    list: (filters?: RoutineFilters) => Promise<Routine[]>,
    create: (data: CreateRoutineData) => Promise<Routine>,
    update: (id: string, data: UpdateRoutineData) => Promise<Routine>,
    delete: (id: string) => Promise<void>,
  },

  // Users
  users: {
    getProfile: () => Promise<Profile>,
    updateProfile: (data: UpdateProfileData) => Promise<Profile>,
    completeOnboarding: () => Promise<void>,
  },
};

// All requests include Authorization header with Supabase JWT
// Headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
```

### 4.6 Utilities

#### utils.ts
```typescript
// Class name utility (clsx + tailwind-merge)
export function cn(...inputs: ClassValue[]): string

// Date formatting
export function formatDate(date: Date | string): string        // "Jan 15, 2024"
export function formatTime(date: Date | string): string        // "2:30 PM"
export function formatRelativeTime(date: Date | string): string // "5 minutes ago"

// Helpers
export function generateId(): string                           // UUID v4
export function sleep(ms: number): Promise<void>
export function truncate(str: string, length: number): string
export function capitalize(str: string): string
export function debounce<T>(fn: T, delay: number): T
```

#### Supabase Clients

##### client.ts (Browser)
```typescript
export function createClient(): SupabaseClient<Database>
export function getSupabaseClient(): SupabaseClient<Database>  // Singleton
```

##### server.ts (Server Components)
```typescript
export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>>
export async function getUser(): Promise<User | null>
export async function getSession(): Promise<Session | null>
```

##### middleware.ts (Auth Middleware)
```typescript
export async function updateSession(request: NextRequest): Promise<NextResponse>
// Refreshes session, handles protected route redirects
```

### 4.7 Types

#### supabase.ts (Auto-generated)
```typescript
export interface Database {
  public: {
    Tables: {
      profiles: { Row, Insert, Update };
      routines: { Row, Insert, Update };
      plans: { Row, Insert, Update };
      tasks: { Row, Insert, Update };
      activity_logs: { Row, Insert, Update };
      conversations: { Row, Insert, Update };
    };
    Enums: {
      day_type: 'weekday' | 'weekend' | 'both';
      time_of_day: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
      energy_level: 'low' | 'medium' | 'high';
      plan_status: 'active' | 'completed' | 'cancelled';
      plan_type: 'daily' | 'weekly';
      task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      task_priority: 'low' | 'medium' | 'high' | 'urgent';
      task_source: 'manual' | 'conversation' | 'system';
      conversation_role: 'user' | 'assistant' | 'system' | 'tool';
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
```

---

## 5. Backend Architecture

### 5.1 Entry Point & Configuration

#### main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Vibe Planner API",
    version="1.0.0",
)

# CORS - Allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(tasks_router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(routines_router, prefix="/api/v1/routines", tags=["routines"])
app.include_router(plans_router, prefix="/api/v1/plans", tags=["plans"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(ws_router, prefix="/api/v1/chat", tags=["websocket"])

# Health check endpoints
@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "vibe-planner-api"}

# Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### config.py
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Environment
    environment: str = "development"
    debug: bool = True

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # Groq AI
    groq_api_key: str = ""

    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]

    # Rate Limiting
    rate_limit_per_minute: int = 60

    # LLM Settings
    llm_model: str = "openai/gpt-oss-120b"
    llm_max_tokens: int = 4096
    llm_temperature: float = 0.7
    llm_reasoning_effort: str = "medium"

    class Config:
        env_file = ".env"

settings = Settings()
```

### 5.2 API Routes

#### Chat Routes (`routes/chat.py`)
```python
router = APIRouter()

@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    user: dict = Depends(get_current_user),
    orchestrator: AIOrchestrator = Depends(get_orchestrator),
) -> ChatMessageResponse:
    """Non-streaming chat endpoint"""
    # Process message through orchestrator
    # Returns: { content, tool_calls, session_id }

@router.get("/history/{session_id}", response_model=ConversationHistoryResponse)
async def get_history(
    session_id: str,
    user: dict = Depends(get_current_user),
) -> ConversationHistoryResponse:
    """Get conversation history for a session"""
    # Returns: { messages: [...], session_id }

# Models
class ChatMessageRequest(BaseModel):
    content: str
    session_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    content: str
    tool_calls: List[ToolCallResult] = []
    session_id: str
```

#### Task Routes (`routes/tasks.py`)
```python
router = APIRouter()

@router.get("", response_model=TaskListResponse)
async def list_tasks(
    status: Optional[str] = None,      # pending, in_progress, completed, cancelled
    priority: Optional[str] = None,    # low, medium, high, urgent
    due_date: Optional[date] = None,
    search: Optional[str] = None,
    user: dict = Depends(get_current_user),
) -> TaskListResponse:
    """List tasks with optional filters"""

@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task: TaskCreate,
    user: dict = Depends(get_current_user),
) -> TaskResponse:
    """Create a new task"""

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    user: dict = Depends(get_current_user),
) -> TaskResponse:
    """Get a single task by ID"""

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task: TaskUpdate,
    user: dict = Depends(get_current_user),
) -> TaskResponse:
    """Update a task"""

@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: UUID,
    user: dict = Depends(get_current_user),
) -> None:
    """Delete a task"""

# Models
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    tags: List[str] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    tags: Optional[List[str]] = None
```

#### Routine Routes (`routes/routines.py`)
```python
router = APIRouter()

@router.get("", response_model=RoutineListResponse)
async def list_routines(
    day_type: Optional[str] = None,    # weekday, weekend, both
    is_active: Optional[bool] = None,
    user: dict = Depends(get_current_user),
) -> RoutineListResponse:

@router.post("", response_model=RoutineResponse, status_code=201)
async def create_routine(routine: RoutineCreate, user: dict = Depends(get_current_user)):

@router.patch("/{routine_id}", response_model=RoutineResponse)
async def update_routine(routine_id: UUID, routine: RoutineUpdate, user: dict = Depends(get_current_user)):

@router.delete("/{routine_id}", status_code=204)
async def delete_routine(routine_id: UUID, user: dict = Depends(get_current_user)):

# Models
class RoutineCreate(BaseModel):
    title: str
    description: Optional[str] = None
    day_type: str = "both"            # weekday, weekend, both
    time_of_day: str = "anytime"      # morning, afternoon, evening, night, anytime
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    energy_level: str = "medium"      # low, medium, high
```

#### User Routes (`routes/users.py`)
```python
router = APIRouter()

@router.get("/me", response_model=ProfileResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    """Get current user's profile"""

@router.patch("/me", response_model=ProfileResponse)
async def update_profile(profile: ProfileUpdate, user: dict = Depends(get_current_user)):
    """Update profile (full_name, timezone, preferences)"""

@router.post("/onboarding/complete", status_code=200)
async def complete_onboarding(user: dict = Depends(get_current_user)):
    """Mark onboarding as completed"""

# Models
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    timezone: Optional[str] = None
    preferences: Optional[dict] = None
```

#### Plan Routes (`routes/plans.py`)
```python
router = APIRouter()

@router.get("", response_model=PlanListResponse)
async def list_plans(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    plan_type: Optional[str] = None,   # daily, weekly
    user: dict = Depends(get_current_user),
):

@router.get("/{plan_id}", response_model=PlanWithTasksResponse)
async def get_plan(plan_id: UUID, user: dict = Depends(get_current_user)):
    """Get plan with associated tasks"""

@router.post("/generate", response_model=PlanResponse, status_code=201)
async def generate_plan(request: GeneratePlanRequest, user: dict = Depends(get_current_user)):
    """Generate a new plan for a date"""
```

### 5.3 WebSocket Handler

#### chat_ws.py
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

router = APIRouter()

class ConnectionManager:
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
    """Decode JWT without verification (Supabase handles auth)"""
    decoded = jwt.decode(token, key="", options={"verify_signature": False, "verify_aud": False})
    return {"id": decoded.get("sub"), "email": decoded.get("email")}

@router.websocket("/stream")
async def chat_websocket(websocket: WebSocket, token: str = Query(...)):
    """
    WebSocket endpoint for streaming chat.

    Connect: ws://localhost:8000/api/v1/chat/stream?token={jwt}

    Client Messages:
    - {"type": "message", "content": "...", "session_id": "..."}
    - {"type": "ping"}

    Server Messages:
    - {"type": "connected", "message": "..."}
    - {"type": "stream", "content": "...", "is_final": false}
    - {"type": "tool_call", "tool": "...", "args": {...}, "status": "..."}
    - {"type": "tool_result", "tool": "...", "success": true, "result": {...}}
    - {"type": "error", "message": "..."}
    - {"type": "pong"}
    """
    user = await validate_token(token)
    if not user:
        await websocket.close(code=4001, reason="Invalid token")
        return

    await manager.connect(websocket, user["id"])

    # Initialize AI orchestrator
    llm_client = GroqLLMClient(api_key=settings.groq_api_key)
    orchestrator = AIOrchestrator(llm_client=llm_client)

    # Send connection success
    await websocket.send_json({"type": "connected", "message": "Successfully connected"})

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "ping":
                await websocket.send_json({"type": "pong"})

            elif data["type"] == "message":
                async for chunk in orchestrator.process_message(
                    user_id=user["id"],
                    session_id=data.get("session_id"),
                    message=data["content"]
                ):
                    await websocket.send_json(chunk)

    except WebSocketDisconnect:
        manager.disconnect(user["id"])
```

### 5.4 Services

#### LLM Client (`services/llm/groq_client.py`)
```python
from groq import AsyncGroq

class GroqLLMClient:
    def __init__(self, api_key: str):
        self.async_client = AsyncGroq(api_key=api_key)
        self.model = settings.llm_model  # "openai/gpt-oss-120b"

    def build_messages(
        self,
        user_message: str,
        conversation_history: List[Dict],
        user_context: Dict
    ) -> List[Dict]:
        """Build message list with system prompt and history"""
        messages = [{"role": "system", "content": get_system_prompt(user_context, ...)}]
        messages.extend(conversation_history[-20:])  # Last 20 messages
        messages.append({"role": "user", "content": user_message})
        return messages

    async def chat_stream(
        self,
        user_message: str,
        conversation_history: List[Dict],
        user_context: Dict,
    ) -> AsyncGenerator[Dict, None]:
        """Stream chat completion with tool calling"""
        stream = await self.async_client.chat.completions.create(
            model=self.model,
            messages=self.build_messages(...),
            tools=TOOL_SCHEMAS,
            tool_choice="auto",
            stream=True,
            max_tokens=settings.llm_max_tokens,
            temperature=settings.llm_temperature,
        )

        async for chunk in stream:
            # Handle content chunks
            if delta.content:
                yield {"type": "content", "content": delta.content, "is_final": False}

            # Handle tool calls
            if delta.tool_calls:
                # Accumulate tool call arguments
                yield {"type": "tool_call", "id": ..., "name": ..., "arguments": ...}

            # Handle completion
            if finish_reason:
                yield {"type": "done", "finish_reason": finish_reason}

    async def continue_with_tool_results(
        self,
        conversation_history: List[Dict],
        tool_results: List[Dict],
        user_context: Dict
    ) -> AsyncGenerator[Dict, None]:
        """Continue after tool execution"""
        # Add tool results to messages and get follow-up response
```

#### System Prompts (`services/llm/prompts.py`)
```python
SYSTEM_PROMPT_TEMPLATE = """
You are Vibe Planner, a friendly and efficient AI assistant for task and schedule management.

Current Context:
- Date: {current_date}
- Time: {current_time}
- User Timezone: {timezone}
- User Name: {full_name}

User Preferences:
{preferences}

User Routines:
{routines}

Your Capabilities:
- Create, update, and delete tasks
- View and manage schedules
- Track routines and habits
- Provide productivity insights

Guidelines:
1. Be concise but helpful
2. Always confirm before making changes
3. Use tools when appropriate
4. Be proactive about scheduling conflicts
5. Remember user preferences
"""

def get_system_prompt(
    user_context: Dict,
    current_date: str,
    current_time: str
) -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        current_date=current_date,
        current_time=current_time,
        timezone=user_context.get("timezone", "UTC"),
        full_name=user_context.get("full_name", "there"),
        preferences=json.dumps(user_context.get("preferences", {})),
        routines=format_routines(user_context.get("routines", [])),
    )
```

#### AI Orchestrator (`services/orchestrator/agent.py`)
```python
class AIOrchestrator:
    def __init__(self, llm_client: GroqLLMClient):
        self.llm_client = llm_client
        self.supabase = get_supabase_client()

    async def get_user_context(self, user_id: str) -> Dict:
        """Fetch user profile, preferences, and routines"""
        profile = await self.supabase.table("profiles").select("*").eq("id", user_id).single()
        routines = await self.supabase.table("routines").select("*").eq("user_id", user_id).eq("is_active", True)
        return {
            "full_name": profile.get("full_name"),
            "timezone": profile.get("timezone"),
            "preferences": profile.get("preferences"),
            "routines": routines,
            "onboarding_completed": profile.get("onboarding_completed"),
        }

    async def get_conversation_history(self, user_id: str, session_id: str, limit: int = 20) -> List[Dict]:
        """Get recent conversation messages"""
        response = await self.supabase.table("conversations") \
            .select("role, content, tool_calls, tool_call_id") \
            .eq("user_id", user_id) \
            .eq("session_id", session_id) \
            .order("created_at") \
            .limit(limit)
        return response.data

    async def save_message(self, user_id: str, session_id: str, role: str, content: str, ...):
        """Store message in database"""
        await self.supabase.table("conversations").insert({...})

    async def process_message(
        self,
        user_id: str,
        session_id: str,
        message: str
    ) -> AsyncGenerator[Dict, None]:
        """
        Main processing loop:
        1. Get user context and history
        2. Save user message
        3. Stream LLM response
        4. If tool calls, execute and continue
        5. Save assistant response
        """
        user_context = await self.get_user_context(user_id)
        history = await self.get_conversation_history(user_id, session_id)
        await self.save_message(user_id, session_id, "user", message)

        tool_executor = ToolExecutor(user_id)

        async for chunk in self.llm_client.chat_stream(message, history, user_context):
            if chunk["type"] == "content":
                yield {"type": "stream", "content": chunk["content"], "is_final": False}

            elif chunk["type"] == "tool_call":
                yield {"type": "tool_call", "tool": chunk["name"], "args": chunk["arguments"], "status": "pending"}

                # Execute tool
                result = await tool_executor.execute(chunk["name"], chunk["arguments"])
                yield {"type": "tool_result", "tool": chunk["name"], "success": result["success"], ...}

                # Continue conversation with tool results
                async for follow_up in self.llm_client.continue_with_tool_results(...):
                    yield follow_up

        yield {"type": "stream", "content": "", "is_final": True}
```

#### Tool Executor (`services/orchestrator/tool_executor.py`)
```python
class ToolExecutor:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.supabase = get_supabase_client()

    async def execute(self, tool_name: str, arguments: Dict) -> Dict:
        """Route tool call to appropriate handler"""
        handlers = {
            "create_task": self._create_task,
            "update_task": self._update_task,
            "delete_task": self._delete_task,
            "list_tasks": self._list_tasks,
            "create_routine": self._create_routine,
            "get_schedule": self._get_schedule,
            "get_user_context": self._get_user_context,
        }

        if tool_name not in handlers:
            return {"success": False, "error": f"Unknown tool: {tool_name}"}

        return await handlers[tool_name](arguments)

    async def _create_task(self, args: Dict) -> Dict:
        """Create a new task"""
        task_data = {
            "user_id": self.user_id,
            "title": args["title"],
            "description": args.get("description"),
            "priority": args.get("priority", "medium"),
            "due_date": args.get("due_date"),
            "due_time": args.get("due_time"),
            "duration_minutes": args.get("duration_minutes"),
            "status": "pending",
            "source": "conversation",
        }
        result = await self.supabase.table("tasks").insert(task_data).execute()
        return {"success": True, "result": result.data[0]}

    async def _update_task(self, args: Dict) -> Dict:
        """Update an existing task"""
        task_id = args["task_id"]
        updates = {k: v for k, v in args.items() if k != "task_id" and v is not None}
        result = await self.supabase.table("tasks") \
            .update(updates) \
            .eq("id", task_id) \
            .eq("user_id", self.user_id) \
            .execute()
        return {"success": True, "result": result.data[0]}

    async def _delete_task(self, args: Dict) -> Dict:
        """Delete a task"""
        await self.supabase.table("tasks") \
            .delete() \
            .eq("id", args["task_id"]) \
            .eq("user_id", self.user_id) \
            .execute()
        return {"success": True, "result": {"deleted": args["task_id"]}}

    async def _list_tasks(self, args: Dict) -> Dict:
        """List tasks with filters"""
        query = self.supabase.table("tasks").select("*").eq("user_id", self.user_id)
        if args.get("status"):
            query = query.eq("status", args["status"])
        if args.get("due_date"):
            query = query.eq("due_date", args["due_date"])
        result = await query.execute()
        return {"success": True, "result": result.data}

    async def _get_schedule(self, args: Dict) -> Dict:
        """Get schedule for a date range"""
        start_date = args.get("date", datetime.now().strftime("%Y-%m-%d"))
        end_date = args.get("end_date", start_date)
        tasks = await self.supabase.table("tasks") \
            .select("*") \
            .eq("user_id", self.user_id) \
            .gte("due_date", start_date) \
            .lte("due_date", end_date) \
            .execute()
        return {"success": True, "result": tasks.data}
```

#### Tool Schemas (`services/tools/schemas.py`)
```python
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Task description"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]},
                    "due_date": {"type": "string", "format": "date", "description": "YYYY-MM-DD"},
                    "due_time": {"type": "string", "format": "time", "description": "HH:MM"},
                    "duration_minutes": {"type": "integer", "description": "Estimated duration"},
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update an existing task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "UUID of task to update"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "status": {"type": "string", "enum": ["pending", "in_progress", "completed", "cancelled"]},
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]},
                    "due_date": {"type": "string", "format": "date"},
                    "due_time": {"type": "string", "format": "time"},
                },
                "required": ["task_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "UUID of task to delete"},
                },
                "required": ["task_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List user's tasks with optional filters",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "enum": ["pending", "in_progress", "completed", "cancelled"]},
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]},
                    "due_date": {"type": "string", "format": "date"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_routine",
            "description": "Create a recurring routine",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "day_type": {"type": "string", "enum": ["weekday", "weekend", "both"]},
                    "time_of_day": {"type": "string", "enum": ["morning", "afternoon", "evening", "night", "anytime"]},
                    "duration_minutes": {"type": "integer"},
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_schedule",
            "description": "Get schedule for a specific date or range",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {"type": "string", "format": "date", "description": "Start date (YYYY-MM-DD)"},
                    "end_date": {"type": "string", "format": "date", "description": "End date for range"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_context",
            "description": "Get user's preferences and routines",
            "parameters": {
                "type": "object",
                "properties": {},
            },
        },
    },
]
```

### 5.5 Dependencies

#### dependencies.py
```python
from fastapi import Depends, HTTPException, Header
from app.db.supabase import get_supabase_client

async def get_current_user(authorization: str = Header(...)) -> dict:
    """Validate JWT and return user info"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")
    supabase = get_supabase_client()

    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {
            "id": user_response.user.id,
            "email": user_response.user.email,
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

def get_llm_client() -> GroqLLMClient:
    return GroqLLMClient(api_key=settings.groq_api_key)

def get_orchestrator(llm_client: GroqLLMClient = Depends(get_llm_client)) -> AIOrchestrator:
    return AIOrchestrator(llm_client=llm_client)
```

---

## 6. Database Schema

### 6.1 Tables

#### profiles
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK auth.users | User ID from Supabase Auth |
| username | VARCHAR(50) | UNIQUE | Optional username |
| email | VARCHAR(255) | UNIQUE | User's email |
| full_name | VARCHAR(100) | | Display name |
| avatar_url | TEXT | | Profile picture URL |
| timezone | VARCHAR(50) | DEFAULT 'UTC' | User's timezone |
| onboarding_completed | BOOLEAN | DEFAULT FALSE | Has completed onboarding |
| preferences | JSONB | | User preferences JSON |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |

#### routines
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK profiles, NOT NULL | Owner |
| title | VARCHAR(200) | NOT NULL | Routine name |
| description | TEXT | | Details |
| day_type | VARCHAR(20) | DEFAULT 'both' | weekday/weekend/both |
| time_of_day | VARCHAR(20) | DEFAULT 'anytime' | morning/afternoon/evening/night/anytime |
| start_time | TIME | | Specific start time |
| end_time | TIME | | Specific end time |
| duration_minutes | INTEGER | | Expected duration |
| energy_level | VARCHAR(10) | DEFAULT 'medium' | low/medium/high |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

#### plans
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK profiles, NOT NULL | Owner |
| plan_date | DATE | NOT NULL | Date for the plan |
| plan_type | VARCHAR(20) | DEFAULT 'daily' | daily/weekly |
| status | VARCHAR(20) | DEFAULT 'active' | active/completed/cancelled |
| notes | TEXT | | Plan notes |
| generated_at | TIMESTAMPTZ | | When AI generated |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Constraint**: UNIQUE(user_id, plan_date, plan_type)

#### tasks
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK profiles, NOT NULL | Owner |
| plan_id | UUID | FK plans, NULLABLE | Associated plan |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | | Details |
| status | VARCHAR(20) | DEFAULT 'pending' | pending/in_progress/completed/cancelled |
| priority | VARCHAR(10) | DEFAULT 'medium' | low/medium/high/urgent |
| due_date | DATE | | Due date |
| due_time | TIME | | Due time |
| duration_minutes | INTEGER | | Estimated duration |
| estimated_energy | VARCHAR(10) | DEFAULT 'medium' | low/medium/high |
| tags | TEXT[] | DEFAULT '{}' | Array of tags |
| source | VARCHAR(20) | DEFAULT 'manual' | manual/conversation/system |
| completed_at | TIMESTAMPTZ | | When completed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

#### activity_logs
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK profiles, NOT NULL | Owner |
| task_id | UUID | FK tasks, NULLABLE | Related task |
| action_type | VARCHAR(50) | NOT NULL | Type of action |
| source | VARCHAR(20) | DEFAULT 'manual' | manual/conversation/system |
| raw_text | TEXT | | Original input |
| metadata | JSONB | | Additional data |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

#### conversations
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK profiles, NOT NULL | Owner |
| session_id | UUID | NOT NULL | Chat session ID |
| role | VARCHAR(20) | NOT NULL | user/assistant/system/tool |
| content | TEXT | NOT NULL | Message content |
| tool_calls | JSONB | | Tool calls made |
| tool_call_id | VARCHAR(100) | | For tool responses |
| tokens_used | INTEGER | | Token count |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

### 6.2 Indexes

```sql
-- Routines
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_day_type ON routines(day_type);

-- Plans
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_date ON plans(plan_date);

-- Tasks
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_plan_id ON tasks(plan_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);

-- Conversations
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
```

### 6.3 Row Level Security

All tables have RLS enabled. Policies ensure users can only access their own data:

```sql
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Tasks (example - similar for other tables)
CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);
```

### 6.4 Triggers & Functions

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Applied to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 7. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. USER SIGNUP                                                  │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│     │ /signup  │───▶│ Supabase │───▶│ profiles │               │
│     │   page   │    │   Auth   │    │  table   │               │
│     └──────────┘    └──────────┘    └──────────┘               │
│           │              │               │                       │
│           │        Creates user     Trigger creates              │
│           │         in auth.users    profile row                 │
│           │              │               │                       │
│           ▼              ▼               ▼                       │
│     ┌──────────────────────────────────────┐                    │
│     │  Redirect to /login (email verify)   │                    │
│     └──────────────────────────────────────┘                    │
│                                                                  │
│  2. USER LOGIN                                                   │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│     │ /login   │───▶│ Supabase │───▶│   JWT    │               │
│     │   page   │    │   Auth   │    │  Token   │               │
│     └──────────┘    └──────────┘    └──────────┘               │
│           │                              │                       │
│           │                              │ Stored in             │
│           │                              │ cookies               │
│           ▼                              ▼                       │
│     ┌──────────────────────────────────────┐                    │
│     │     Redirect to /chat (dashboard)    │                    │
│     └──────────────────────────────────────┘                    │
│                                                                  │
│  3. PROTECTED ROUTE ACCESS                                       │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│     │ Request  │───▶│middleware│───▶│ Supabase │               │
│     │ /chat    │    │  .ts     │    │ validate │               │
│     └──────────┘    └──────────┘    └──────────┘               │
│           │              │               │                       │
│           │        Check session    Valid? Allow                 │
│           │        from cookies     Invalid? → /login            │
│                                                                  │
│  4. API REQUEST AUTHENTICATION                                   │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│     │  Client  │───▶│  FastAPI │───▶│ Validate │               │
│     │  fetch   │    │  Backend │    │   JWT    │               │
│     └──────────┘    └──────────┘    └──────────┘               │
│           │              │               │                       │
│      Authorization:      │          Decode token                 │
│      Bearer {token}     get_current_user()                      │
│                         dependency                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. AI Chat Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI CHAT FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐  WebSocket  ┌─────────┐                            │
│  │ Browser │◄───────────▶│ FastAPI │                            │
│  │ (React) │             │ Backend │                            │
│  └────┬────┘             └────┬────┘                            │
│       │                       │                                  │
│       │ 1. Connect            │                                  │
│       │ ws://...?token=JWT    │                                  │
│       │──────────────────────▶│                                  │
│       │                       │                                  │
│       │ 2. {"type":"connected"}                                  │
│       │◀──────────────────────│                                  │
│       │                       │                                  │
│       │ 3. Send message       │                                  │
│       │ {"type":"message",    │                                  │
│       │  "content":"...",     │                                  │
│       │  "session_id":"..."}  │                                  │
│       │──────────────────────▶│                                  │
│       │                       │                                  │
│       │                  ┌────┴────┐                             │
│       │                  │ Orchest-│                             │
│       │                  │  rator  │                             │
│       │                  └────┬────┘                             │
│       │                       │                                  │
│       │                       ├─▶ Get user context               │
│       │                       │   (profile, routines)            │
│       │                       │                                  │
│       │                       ├─▶ Get conversation history       │
│       │                       │   (last 20 messages)             │
│       │                       │                                  │
│       │                       ├─▶ Build messages with            │
│       │                       │   system prompt                  │
│       │                       │                                  │
│       │                  ┌────┴────┐                             │
│       │                  │  Groq   │                             │
│       │                  │   LLM   │                             │
│       │                  └────┬────┘                             │
│       │                       │                                  │
│       │ 4. Stream response    │                                  │
│       │ {"type":"stream",     │                                  │
│       │  "content":"Hi...",   │                                  │
│       │  "is_final":false}    │                                  │
│       │◀──────────────────────│                                  │
│       │◀──────────────────────│ (multiple chunks)                │
│       │                       │                                  │
│       │ 5. If tool call:      │                                  │
│       │ {"type":"tool_call",  │                                  │
│       │  "tool":"create_task",│                                  │
│       │  "args":{...}}        │                                  │
│       │◀──────────────────────│                                  │
│       │                       │                                  │
│       │                  ┌────┴────┐                             │
│       │                  │  Tool   │                             │
│       │                  │Executor │                             │
│       │                  └────┬────┘                             │
│       │                       │                                  │
│       │ 6. Tool result        │                                  │
│       │ {"type":"tool_result",│                                  │
│       │  "success":true,...}  │                                  │
│       │◀──────────────────────│                                  │
│       │                       │                                  │
│       │ 7. Continue streaming │                                  │
│       │ {"type":"stream",...} │                                  │
│       │◀──────────────────────│                                  │
│       │                       │                                  │
│       │ 8. Final marker       │                                  │
│       │ {"type":"stream",     │                                  │
│       │  "is_final":true}     │                                  │
│       │◀──────────────────────│                                  │
│       │                       │                                  │
└───────┴───────────────────────┴──────────────────────────────────┘
```

---

## 9. Tool System

### Available Tools

| Tool | Description | Required Args | Optional Args |
|------|-------------|---------------|---------------|
| `create_task` | Create a new task | `title` | `description`, `priority`, `due_date`, `due_time`, `duration_minutes` |
| `update_task` | Modify existing task | `task_id` | `title`, `description`, `status`, `priority`, `due_date`, `due_time` |
| `delete_task` | Remove a task | `task_id` | - |
| `list_tasks` | Query tasks | - | `status`, `priority`, `due_date` |
| `create_routine` | Add recurring routine | `title` | `description`, `day_type`, `time_of_day`, `duration_minutes` |
| `get_schedule` | View schedule | - | `date`, `end_date` |
| `get_user_context` | Get user preferences | - | - |

### Tool Execution Flow

```
User: "Create a task to buy groceries tomorrow"
                    │
                    ▼
┌──────────────────────────────────────┐
│            LLM Response              │
│  content: "I'll create that task"   │
│  tool_calls: [{                      │
│    name: "create_task",              │
│    arguments: {                      │
│      title: "Buy groceries",         │
│      due_date: "2024-01-16"          │
│    }                                 │
│  }]                                  │
└──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────┐
│           Tool Executor              │
│  1. Validate arguments               │
│  2. Execute database operation       │
│  3. Return result                    │
└──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────┐
│        Continue with LLM             │
│  Messages include tool result        │
│  LLM generates follow-up response    │
└──────────────────────────────────────┘
                    │
                    ▼
Assistant: "Done! I've created the task 'Buy groceries'
            for tomorrow. Is there anything else?"
```

---

## 10. Design System

### CSS Variables (globals.css)

```css
:root {
  /* Brand Colors */
  --brand-cyan: #00D2FF;
  --brand-blue: #3A7BD5;
  --brand-violet: #6A00F4;
  --brand-gradient: linear-gradient(135deg, #00D2FF 0%, #3A7BD5 50%, #6A00F4 100%);

  /* Text Colors */
  --heading: #1E293B;
  --body: #64748B;
  --muted: #94A3B8;

  /* Background Colors */
  --background: #FFFFFF;
  --offwhite: #F8FAFC;
  --slate-grey: #E2E8F0;

  /* Semantic Colors */
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;

  /* Spacing (8px grid) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-brand: 0 4px 14px rgba(58, 123, 213, 0.25);

  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
}
```

### Tailwind Extensions (tailwind.config.js)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-cyan': '#00D2FF',
        'brand-blue': '#3A7BD5',
        'brand-violet': '#6A00F4',
        'heading': '#1E293B',
        'body': '#64748B',
        'offwhite': '#F8FAFC',
        'slate-grey': '#E2E8F0',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'danger': '#EF4444',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 50%, #6A00F4 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px rgba(58, 123, 213, 0.25)',
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'elevation-2': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
    },
  },
};
```

---

## 11. Environment Variables

### Frontend (client/.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (server/.env)
```bash
# Environment
ENVIRONMENT=development
DEBUG=true

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Groq AI
GROQ_API_KEY=gsk_your-groq-api-key

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# LLM Settings
LLM_MODEL=openai/gpt-oss-120b
LLM_MAX_TOKENS=4096
LLM_TEMPERATURE=0.7
```

---

## 12. File Reference Index

### Quick Lookup Table

| Category | File | Line Count | Purpose |
|----------|------|------------|---------|
| **Frontend Entry** | `client/src/app/layout.tsx` | ~30 | Root layout, fonts, providers |
| **Landing Page** | `client/src/app/page.tsx` | ~200 | Hero, features, CTA |
| **Login** | `client/src/app/(auth)/login/page.tsx` | ~150 | Email/password + OAuth |
| **Signup** | `client/src/app/(auth)/signup/page.tsx` | ~180 | Registration form |
| **Chat Page** | `client/src/app/(dashboard)/chat/page.tsx` | ~15 | Chat interface wrapper |
| **Tasks Page** | `client/src/app/(dashboard)/tasks/page.tsx` | ~350 | Task CRUD UI |
| **Schedule Page** | `client/src/app/(dashboard)/schedule/page.tsx` | ~250 | Calendar view |
| **Settings Page** | `client/src/app/(dashboard)/settings/page.tsx` | ~200 | Profile settings |
| **Dashboard Layout** | `client/src/app/(dashboard)/layout.tsx` | ~300 | Sidebar, nav, onboarding |
| **Chat Container** | `client/src/components/chat/ChatContainer.tsx` | ~160 | Main chat UI |
| **Chat Input** | `client/src/components/chat/ChatInput.tsx` | ~80 | Message input |
| **Message Bubble** | `client/src/components/chat/MessageBubble.tsx` | ~100 | Message display |
| **Button** | `client/src/components/ui/Button.tsx` | ~90 | Button variants |
| **Modal** | `client/src/components/ui/Modal.tsx` | ~100 | Dialog component |
| **Toast** | `client/src/components/ui/Toast.tsx` | ~150 | Notifications |
| **useChat Hook** | `client/src/hooks/useChat.ts` | ~290 | WebSocket chat |
| **Chat Store** | `client/src/stores/chatStore.ts` | ~80 | Zustand state |
| **API Client** | `client/src/lib/api.ts` | ~200 | REST API client |
| **Utilities** | `client/src/lib/utils.ts` | ~60 | Helper functions |
| **Middleware** | `client/src/middleware.ts` | ~15 | Route protection |
| **Backend Entry** | `server/main.py` | ~60 | FastAPI app |
| **Config** | `server/app/config.py` | ~50 | Settings |
| **Dependencies** | `server/app/dependencies.py` | ~50 | DI functions |
| **Chat Routes** | `server/app/api/routes/chat.py` | ~100 | Chat endpoints |
| **Task Routes** | `server/app/api/routes/tasks.py` | ~150 | Task CRUD |
| **WebSocket** | `server/app/api/websocket/chat_ws.py` | ~200 | WS handler |
| **Groq Client** | `server/app/services/llm/groq_client.py` | ~250 | LLM client |
| **Prompts** | `server/app/services/llm/prompts.py` | ~100 | System prompts |
| **Orchestrator** | `server/app/services/orchestrator/agent.py` | ~280 | AI coordinator |
| **Tool Executor** | `server/app/services/orchestrator/tool_executor.py` | ~200 | Tool execution |
| **Tool Schemas** | `server/app/services/tools/schemas.py` | ~200 | Tool definitions |
| **DB Schema** | `supabase/migrations/001_initial_schema.sql` | ~200 | Tables |
| **RLS Policies** | `supabase/migrations/002_rls_policies.sql` | ~100 | Security |

---

## Quick Start Commands

```bash
# Frontend
cd client
npm install
npm run dev                    # http://localhost:3000

# Backend
cd server
python -m venv .venv
.venv\Scripts\activate         # Windows
source .venv/bin/activate      # Mac/Linux
pip install -r requirements.txt
python main.py                 # http://localhost:8000

# Database
# Run migrations in Supabase SQL Editor:
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_rls_policies.sql
```

---

*This document is auto-generated and should be updated when significant architectural changes are made.*
