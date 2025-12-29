# Vibe Planner

AI-powered conversational planning assistant that helps you manage tasks, schedules, and routines through natural language.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python, WebSocket streaming
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API with GPT-OSS-120B model

## Features

- Natural language task management
- AI-powered chat with streaming responses
- Tool calling for task/routine CRUD operations
- Real-time WebSocket communication
- Modern, animated UI with design system
- Authentication with Supabase (Email + OAuth)
- Task prioritization and scheduling
- Weekly schedule view

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase account
- Groq API key

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/colabcol4-afk/Planner.git
cd Planner

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
pip install -r requirements.txt
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migrations:
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_rls_policies.sql`
3. Enable Google OAuth (optional):
   - Go to Authentication > Providers > Google
   - Add your Google OAuth credentials

### 3. Configure Environment Variables

**Frontend (`client/.env.local`):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (`server/.env`):**
```bash
ENVIRONMENT=development
DEBUG=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
CORS_ORIGINS=["http://localhost:3000"]
```

### 4. Run the Application

**Start the backend:**
```bash
cd server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Start the frontend (new terminal):**
```bash
cd client
npm run dev
```

Visit `http://localhost:3000` to use the application.

## Project Structure

```
Planner/
├── client/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Pages (App Router)
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   ├── stores/           # Zustand stores
│   │   └── types/            # TypeScript types
│   └── ...
│
├── server/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/              # Routes & WebSocket
│   │   ├── services/         # LLM, Orchestrator, Tools
│   │   ├── db/               # Supabase client
│   │   └── ...
│   └── main.py
│
└── supabase/
    └── migrations/           # SQL migrations
```

## API Endpoints

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat/message` | Send chat message |
| GET | `/api/v1/tasks` | List tasks |
| POST | `/api/v1/tasks` | Create task |
| PATCH | `/api/v1/tasks/{id}` | Update task |
| DELETE | `/api/v1/tasks/{id}` | Delete task |
| GET | `/api/v1/routines` | List routines |
| GET | `/api/v1/users/me` | Get profile |

### WebSocket

Connect to `ws://localhost:8000/api/v1/chat/stream?token={jwt}` for streaming chat.

## AI Chat Commands

The AI assistant understands natural language. Try:

- "Add a meeting with John tomorrow at 2pm"
- "What's on my schedule today?"
- "Mark my dentist appointment as done"
- "Show me all high priority tasks"
- "Create a morning routine for weekdays"

## Development

### Running Tests

```bash
# Backend tests
cd server
pytest

# Frontend (if tests added)
cd client
npm test
```

### Building for Production

```bash
# Frontend
cd client
npm run build

# Backend - use gunicorn or uvicorn
cd server
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Design System

The app uses a custom design system with:

- **Colors**: Brand gradient (Cyan → Blue → Violet)
- **Typography**: Inter font family
- **Spacing**: 8px base grid
- **Components**: Button, Input, Card, Modal, Toast

See `design_standards.md` for full documentation.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with Groq GPT-OSS-120B and Supabase
