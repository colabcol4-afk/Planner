# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Vibe Planner** is an AI-powered conversational planning application for busy professionals and founders. The product combines text and voice interactions to help users manage their schedules, track tasks, and gain productivity insights.

**Tech Stack:**
- **Frontend:** Next.js (React) with TypeScript
- **Backend:** FastAPI (Python)
- **Database & Auth:** Supabase (PostgreSQL + OAuth)
- **AI Services:** Groq (Whisper STT, GPT-OSS-120B LLM), Gemini TTS
- **Hosting:** Render (frontend + backend services)

## Development Commands

### Frontend (Next.js)
```bash
npm run dev           # Start local development server
npm run build         # Build for production
npm run test          # Run tests
npm run lint          # Lint codebase
```

### Backend (FastAPI)
```bash
uvicorn main:app --reload     # Start local dev server with hot reload
pytest tests/                  # Run all tests
pytest tests/test_file.py      # Run specific test file
python -m black src/           # Format code
python -m ruff check src/      # Lint Python code
```

### Database (Supabase)
```bash
# Connect to local Supabase instance
supabase start

# Apply migrations
supabase db push

# Generate TypeScript types from database
supabase gen types typescript --local > types/supabase.ts
```

## Architecture Overview

### High-Level System Design

The application consists of four main service layers:

1. **Frontend (Next.js)**
   - Chat UI with streaming WebSocket
   - Voice UI with microphone capture (WebM/Opus encoding)
   - Dashboard & Analytics views
   - Task management interface

2. **Backend API Layer (FastAPI Services)**
   - **Chat Agent Service:** Handles text conversations, manages context, calls LLM
   - **Speech Gateway:** WebRTC/WebSocket audio processing, VAD, forwards to STT
   - **AI Orchestrator:** Unifies text/voice inputs, validates tool calls, executes DB actions
   - **TTS Adapter:** Converts LLM responses to speech via Gemini TTS

3. **External AI Services**
   - **Groq Whisper (STT):** Real-time speech-to-text with < 3s latency
   - **GPT-OSS-120B (LLM):** Conversation engine with tool calling (< 800ms first-token)
   - **Gemini TTS:** Text-to-speech synthesis with < 1s latency

4. **Data Layer (Supabase + PostgreSQL)**
   - User profiles, routines, plans, tasks, activity logs
   - Real-time subscriptions
   - Row-level security policies

### Database Schema

```
users             → Basic user profile (id, username, email)
routines          → User habits/schedules (weekday/weekend variants)
plans             → Generated daily/weekly plans
tasks             → Individual tasks (belongs to plans)
activity_logs     → Tracking log (manual/conversational sources)
```

### Conversational AI Flow

**Text Chat:**
```
User Input (text)
  → AI Orchestrator (context management + LLM call)
  → Tool Call Validation (JSON Schema)
  → DB Action Execution
  → Streaming Response to Frontend
```

**Voice Interaction:**
```
Browser Mic (audio chunks)
  → Speech Gateway (WebSocket + VAD preprocessing)
  → Groq Whisper STT (partial + final transcripts)
  → AI Orchestrator (same as text flow)
  → TTS Adapter (Gemini TTS)
  → Audio Stream to Browser
```

### Tool-Based LLM Integration

The LLM (GPT-OSS-120B) outputs structured JSON tool calls that the backend validates and executes:

```json
{
  "tool": "create_task",
  "args": {
    "title": "Follow up with investor",
    "date": "2026-01-06",
    "duration_minutes": 30
  }
}
```

**Key principles:**
- All tool schemas are validated with strict JSON Schema
- Safety checks prevent unauthorized DB modifications
- Context is split into short-term (last 10-20 messages) and long-term (structured planner facts in DB)

## Design System

The project uses a comprehensive design system with CSS variables. Key tokens:

**Colors:**
- `--brand-cyan: #00D2FF`
- `--brand-blue: #3A7BD5`
- `--brand-violet: #6A00F4`
- `--brand-gradient: linear-gradient(135deg, cyan → blue → violet)`
- `--heading: #1E293B` (dark navy)
- `--body: #64748B` (cool grey)

**Typography:**
- Font: Inter (system-ui fallback)
- Base: 16px / 1rem, 8pt grid system
- Weights: 400 (regular), 600 (semibold), 700 (bold)

**Spacing:**
- Base grid: 8px
- Tokens: `--spacing-xs` (4px), `--spacing-sm` (8px), `--spacing-md` (16px), `--spacing-lg` (24px), `--spacing-xl` (32px)

**Component Library:**
- Button (primary gradient, secondary, ghost)
- Input/Textarea
- Card (with elevation-1 shadow)
- Modal
- Toast
- VoiceWidget (microphone + waveform + state)

**Accessibility:**
- WCAG AA contrast requirements (4.5:1)
- Minimum 44x44px touch targets
- Visible focus states for all interactive elements
- ARIA roles for live-updating conversational responses

## Important Implementation Guidelines

### Conversational Onboarding
- Assistant asks progressive questions about work hours, routines, energy levels
- Onboarding ends when assistant has sufficient data
- Store responses in `routines` table (day_type: weekday/weekend)

### Real-Time Communication
- Use WebSocket for streaming transcripts and LLM responses
- Implement partial transcript handling for low-latency UX
- Buffer LLM streaming responses until first complete sentence for TTS

### Error Handling & Fallbacks
- **STT fails:** Fallback to smaller distil-whisper model or batch processing
- **TTS fails:** Fallback to plain text or pre-recorded neutral voice
- **LLM unavailable:** Queue requests for retry with exponential backoff
- **Low STT confidence (< 0.7):** Ask confirmation instead of executing actions

### Security & Privacy
- All AI endpoints require authenticated JWT tokens
- Audio storage requires explicit user opt-in (default ephemeral)
- PII redaction for stored transcripts
- Rate limiting per user to prevent abuse

### Performance & Cost Optimization
- Cache TTS responses for repeated phrases
- Use token caching for repeated LLM prompts
- CDN for static audio assets
- Implement VAD (Voice Activity Detection) to reduce unnecessary STT calls

### Testing Strategy
- Unit tests for tool schema validation
- Integration tests with mocked AI endpoints
- E2E tests with recorded audio streams and golden transcripts
- Human eval for intent accuracy and user satisfaction

## Configuration & Environment

Required environment variables (`.env`):

```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services
GROQ_API_KEY=
GEMINI_API_KEY=

# App Config
NODE_ENV=development
API_BASE_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

## Development Phases

**Current Status:** Phase 0 (Documentation phase, no production code yet)

**Phase 0 — Internal Alpha**
- Text chat only (GPT-OSS-120B)
- Basic tool schemas + DB write flows
- No voice interaction

**Phase 1 — Voice Beta**
- Add Speech Gateway + Whisper STT streaming
- TTS integration for short responses
- Audio storage opt-in

**Phase 2 — Full Production**
- Multi-region deployment
- Long-context conversation support
- Voice personality customization
- Analytics dashboards for voice metrics

## Repository Information

- **GitHub:** https://github.com/colabcol4-afk/Planner.git
- **Main Branch:** `main`
- **Development Branch:** `v0`

## Non-Functional Requirements

**Latency Targets:**
- STT (speech → transcript): < 3s
- LLM first-token: < 800ms (short prompts), < 2s (long-context)
- TTS (text → audio): < 1s

**Quality Targets:**
- 99.9% SLA for core AI endpoints
- Multi-region deployment for redundancy
- WCAG AA compliance for accessibility
