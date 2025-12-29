
# Product Requirements Document (PRD)
## Product Name: **Vibe Planner**

---

## 1. Overview

**Vibe Planner** is a smart, playful, AI-powered planning web application designed for busy professionals—especially founders and early-stage entrepreneurs—whose days are highly dynamic and fragmented.  
The product embeds a conversational assistant that interacts naturally with users, understands their weekly routines, and generates optimized daily and weekly plans.

Users can:
- Manually track tasks via a UI
- Conversationally report what they did during the day
- Review performance and trends via analytics dashboards

The tone of the assistant is quirky, friendly, and intelligent—focused on *planning the vibe of the day*, not just the tasks.

---

## 2. Target Audience

**Primary Users**
- Startup founders
- Solopreneurs
- Busy professionals with irregular schedules

**User Characteristics**
- Limited time for rigid planning
- Prefer conversational and low-friction tools
- Value insights and retrospection
- Comfortable with modern web apps

---

## 3. Core Value Proposition

- Conversational onboarding instead of form-heavy setup
- Dual tracking: manual + conversational
- Adaptive planning based on real behavior
- Clear insights into productivity patterns over time

---

## 4. Functional Requirements

### 4.1 Conversational Onboarding
- Assistant asks questions about:
  - Work hours
  - Recurring commitments
  - Energy levels
  - Personal routines
  - Weekday vs weekend differences
- Onboarding ends when assistant is confident it has sufficient data

### 4.2 Smart Planning Engine
- Generates:
  - Weekly structure
  - Daily task plans
- Plans are editable by the user
- Supports weekdays and weekends separately

### 4.3 Task Tracking
**Manual**
- Checkbox-based task completion in UI

**Conversational**
- User can tell the assistant what they did
- Assistant maps conversation → tasks → completion

### 4.4 Dashboard & Analytics
- Views:
  - Weekly summary
  - Monthly trends
  - Yearly overview
- Metrics:
  - Completion rate
  - Consistency
  - Missed vs completed tasks
  - Productivity trends

---

## 5. Technical Architecture

### 5.1 Frontend
- **Framework:** Next.js
- **Responsibilities:**
  - UI/UX
  - Task views
  - Dashboard visualizations
  - Chat interface

### 5.2 Backend
- **Framework:** FastAPI
- **Responsibilities:**
  - Business logic
  - Planning orchestration
  - AI interaction layer
  - Data aggregation for dashboards

### 5.3 Database & Auth
- **Platform:** Supabase
- **Uses:**
  - PostgreSQL database
  - Authentication
  - Google OAuth

### 5.4 Hosting
- **Platform:** Render
- **Setup:**
  - Frontend service
  - Backend service

---

## 6. Authentication

- Username + Email + Password signup
- No email verification initially
- Google OAuth via Supabase
- Auth handled entirely by Supabase

---

## 7. Database Design

### 7.1 Tables

#### users
- id (uuid, PK)
- username
- email
- created_at

#### routines
- id (uuid, PK)
- user_id (FK → users.id)
- description
- day_type (weekday/weekend)
- created_at

#### plans
- id (uuid, PK)
- user_id (FK)
- date
- generated_at

#### tasks
- id (uuid, PK)
- plan_id (FK → plans.id)
- title
- description
- status (pending/completed)
- completed_at

#### activity_logs
- id (uuid, PK)
- user_id (FK)
- source (manual/conversation)
- raw_text
- created_at

---

## 8. Development Environment

- Local Next.js dev server
- FastAPI with Uvicorn
- Supabase local/hosted instance
- Environment variables via `.env`

---

## 9. Non-Goals (Phase 1)

- Automatic calendar integrations
- Push notifications
- Voice input/output
- Mobile app

---

## 10. Future Enhancements

- Calendar sync (Google/Outlook)
- AI-driven rescheduling
- Productivity scoring
- Mobile-first experience

---

## 11. Success Metrics

- Daily active usage
- Task completion rate
- Retention over 7 / 30 days
- Dashboard engagement

---

## 12. Risks & Mitigation

| Risk | Mitigation |
|----|----|
| Overcomplex onboarding | Progressive conversation |
| AI misunderstanding tasks | Manual override |
| User drop-off | Fast value delivery |

---

## 13. Summary

Vibe Planner combines conversational AI, flexible planning, and insightful analytics to help busy professionals regain control of their time—without killing the vibe.
