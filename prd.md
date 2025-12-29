# Vibe Planner — Technical PRD (Technical + Implementation Focus)

**Scope:** make the PRD technical and prescriptive for the **Chat Agent** and **Voice Agent (STT <-> LLM <-> TTS)** implementation. This doc focuses only on the AI interaction layer & related infra. It assumes existing frontend (Next.js), backend (FastAPI) and Supabase auth/data.

---

## 0. Summary (high-level)

Implement two tightly-integrated conversational surfaces:

1. **Chat Agent (text)** — typical conversational flow (user text ➜ LLM ➜ assistant text). Supports streaming responses, context windows, tool calls (planner engine), and safety controls.
2. **Voice Agent (audio)** — real-time / near-real-time voice experience using:

   * **STT:** OpenAI Whisper (deployed on Groq)
   * **LLM:** GPT-OSS-120B (Groq-hosted or Groq-compatible endpoint)
   * **TTS:** Gemini TTS (Google Gemini API / Gemini-TTS)

Goals: low-latency, robust fallbacks, clear telemetry for transcription & intent accuracy, and deterministic mapping from conversational utterances → tasks/plans.

---

## 1. Non-functional targets

* **Max one-way latency targets (cold calls):**

  * STT (upload → transcript ready): **< 3000 ms** for short utterances (0–10s) when using streaming/low-latency endpoint.
  * LLM first-token latency (streaming): **< 800 ms** for short prompts; **< 2s** for long-context calls (depends on Groq instance type).
  * TTS generation (text → audio ready): **< 1000 ms** for short responses (0–5s output), streaming allowed.
* **Cost sensitivity:** design for batching and caching; enable token caching for repeated prompts.
* **Availability:** 99.9% SLA for core AI endpoints (deploy multi-region where possible).
* **Privacy:** user audio + transcriptions stored only when user opts-in; default ephemeral processing with short retention (e.g., 24–72 hours) for debugging.

---

## 2. High-level architecture (components)

* **Frontend (Next.js)**

  * Chat UI (text) with streaming websocket connection.
  * Voice UI component that captures mic audio, encodes to WebM/Opus and streams to Speech Gateway via WebRTC/WS.
* **Speech Gateway (FastAPI service / separate microservice)**

  * Responsibilities: receive browser audio (WebRTC/WS), audio chunking, pre-processing (VAD, normalization), forward to STT endpoint (Groq), stream transcripts back.
* **AI Orchestrator (FastAPI / internal service)**

  * Receives transcripts (from Speech Gateway) or text messages (from frontend)
  * Manages conversation state, context window, tool invocation (planner engine), safety checks, usage of LLM (Groq GPT-OSS-120B)
  * Emits encoded responses (text) to downstream TTS or sends text streams to frontend
* **TTS Adapter (FastAPI endpoint or serverless function)**

  * Accepts text + voice parameters → calls Gemini TTS API (synchronous or streaming)
  * Returns an audio stream (WebM/Opus or MP3) to frontend or stores an audio blob in CDN for playback
* **Media CDN / Storage** (S3-compatible) for storing generated audio when persistence is needed
* **Logging & Metrics** (Prometheus/Grafana, Sentry)

Sequence (voice request):

User mic (browser) → Speech Gateway (WebRTC/WS + VAD) → Groq Whisper (stream) → Transcript (partial + final) → AI Orchestrator (conversation policy + LLM call to GPT-OSS-120B) → Text response → Gemini TTS (streaming) → Audio to user

---

## 3. Data formats & transport

### 3.1 Audio capture and encoding (browser)

* Recommended encoding: **WebM/Opus** or **PCM16 (wav)** depending on browser support.
* Sample rate: **16kHz or 24kHz** for Whisper models; record native sample rate and resample in gateway if required.
* Chunk size: **200–500 ms** per chunk for streaming; send as binary frames over WebSocket or via WebRTC DataChannel.

### 3.2 WebSocket events (example)

**From client → Speech Gateway**

```json
{ "type": "chunk", "seq": 12, "format": "webm-opus", "audio": "<base64>" }
{ "type": "vad", "state": "no-speech" }
{ "type": "end_of_stream" }
```

**From Speech Gateway → Client**

```json
{ "type": "transcript.partial", "text": "i want to reschedule", "is_final": false }
{ "type": "transcript.final", "text": "I want to reschedule my Tuesday calls", "is_final": true }
```

**From Orchestrator → TTS Adapter**

```json
{ "text": "Sure — I moved your Tuesday calls to Wednesday at 3pm.",
  "voice": "alloy_male_1",
  "speed": 1.0 }
```

---

## 4. STT (Groq OpenAI Whisper on Groq)

### Decisions & rationale

* Use **OpenAI Whisper** (Large v3 / Large v3 Turbo or Distil-Whisper depending on cost/latency) deployed on **Groq** for high throughput and low latency.
* Use streaming endpoint for partial transcripts to produce responsive assistant behavior (start LLM reasoning when partial transcript suggests intent).

### Integration notes

* Speech Gateway will present audio to Groq STT endpoint using the recommended framing (multipart or streaming binary frames depending on Groq SDK).
* Provide language hint, profanity filter, and a domain-specific custom vocabulary (planner names, user-defined routine labels) via `hints` or `prompt` fields if supported by the endpoint.
* On partial results, apply fuzzy intent classifier locally to decide whether to begin an LLM call early (tradeoff between accuracy & latency).

### Fallbacks

* If STT confidence < threshold (configurable, default 0.7) then ask a short confirmation question rather than committing to action.
* If Groq endpoint is unavailable, fallback to server-side on-device Whisper (smaller distil model) or queue audio for batch transcription.

---

## 5. LLM orchestration (GPT-OSS-120B via Groq)

### Conversation state

* Keep two layers of context:

  * **Short-term context**: last N messages + recent meta (10–20 messages depending on token budget)
  * **Planner context**: conversation-derived facts and structured entities (JSON): habits, recurring events, energy profile, preferences

* Persist planner context in DB (`routines`, `plans`, `activity_logs`) and treat it as authoritative for tool actions.

### Prompting strategy

* Use a modular prompt structure:

  1. System instruction (persona, safety rules, allowed DB actions)
  2. Planner facts (JSON, trimmed to fit)
  3. User transcript (or text message)
  4. Tool invocation template (if requesting DB update)

* Use `reasoning_effort` parameter when calling GPT-OSS-120B to tune CPU/latency vs deeper reasoning.

### Tools & Actions

* Design a small *Tooling API* the LLM can request via structured output (JSON schema). Example:

```json
{"tool":"create_task","args": {"title":"Follow up with investor","date":"2026-01-06","duration":30}}
```

* The Orchestrator verifies the tool output schema with a strict JSON Schema and runs safety checks before applying changes.

### Streaming

* Use streaming LLM responses to send partial tokens to TTS Adapter or Frontend (for text chat). For voice, buffer until the first sentence or reasonable chunk to feed to TTS.

---

## 6. TTS (Gemini TTS)

### Decisions & rationale

* Use **Gemini TTS** for expressive, controllable voice generation with natural prosody and multi-speaker support.
* Use streaming TTS where possible to reduce perceived latency and allow progressive audio playback.

### Integration notes

* TTS Adapter will call Gemini TTS API with:

  * `voice` selection (user preference)
  * `style` prompt (quirky / neutral / professional)
  * SSML or prompt annotations to control emphasis, pauses, and phoneme hints for names.
* Accept either returned streaming audio (pipe directly to frontend) or a generated audio blob URL (store on CDN for later playback).

### Caching

* Cache TTS audio for repeated phrases (confirmation dialogs, frequent responses) to reduce costs and latency.

### Fallbacks

* On TTS failure, fallback to sending plain-text and optionally a pre-recorded neutral TTS voice.

---

## 7. Security, privacy & compliance

* **Auth:** All AI endpoints require an authenticated service token (short-lived signed JWTs). Frontend never holds the API key for external services.
* **Audio storage:** stored only if user consents; default ephemeral encryption at rest.
* **PII redaction:** Run an optional PII redaction pass on transcripts before storing (names, credit card numbers, etc.).
* **Rate limiting**: guard against abuse from automated clients (CAPTCHA + rate limits per user)

---

## 8. Monitoring & Observability

* Track these key metrics:

  * STT latency / per-utterance word error rate (WER)
  * LLM token latency, error rates, reasoning_effort vs latency
  * TTS latency and audio generation errors
  * Transcript confidence distribution
  * Tool invocation failures / invalid schemas

* Logging: capture request_id across Speech Gateway → Orchestrator → TTS for traceability.

* Alerts: SLO breaches (latency > threshold), error spikes, WER drift.

---

## 9. API surface (suggested routes)

### Speech Gateway

* `POST /ws/speech` — WebSocket endpoint for streaming audio chunks and receiving transcripts (partial + final)
* `POST /v1/audio/upload` — chunked upload fallback for browsers without WS

### Orchestrator

* `POST /v1/converse` — synchronous text conversation (returns streaming text)
* `POST /v1/converse/stream` — websocket streaming conversation endpoint (text + audio triggers)
* `POST /v1/tools/execute` — internal, executes validated tool calls

### TTS Adapter

* `POST /v1/tts` — {text, voice, format, ssml} → returns streaming audio url/stream

---

## 10. Developer ergonomics & infra

* Provide local mock endpoints for Groq STT and GPT-OSS 120B using small open-source variants for offline dev (distil-whisper / gpt-oss-20b or local Llama 2-lite)
* Provide an SDK `ai-orchestrator-sdk` (TypeScript + Python) that:

  * wraps prompt templates
  * validates tool output schemas
  * provides helpers for streaming audio ↔ text bridging

---

## 11. Testing strategy

* Unit tests for schema validation and tool execution.
* Integration tests (mocked Groq & Gemini endpoints) to assert conversation → DB actions mapping.
* E2E tests with recorded audio streams and golden transcripts.
* Human eval runs: measure intent accuracy and user satisfaction (A/B test with fallback behaviours).

---

## 12. Rollout & Phasing

**Phase 0 — Internal alpha**

* Text chat only using GPT-OSS-120B (Groq endpoint or hosted alternative) with no voice.
* Basic tool schemas + DB write flows.

**Phase 1 — Voice beta**

* Add Speech Gateway + Groq Whisper streaming + TTS (Gemini) streaming for short flows (confirmations, small edits)
* Soft opt-in for audio storage and robust fallback paths.

**Phase 2 — Full production**

* Multiregion deployments, caching, long-context support, richer voice personalities, analytics dashboards for voice metrics.

---

## 13. Open implementation notes and TODOs

* Confirm the chosen Groq region, instance class and expected concurrency for GPT-OSS-120B (cost/latency tradeoffs).
* Build a minimal client-side Voice component supporting both WebSocket and WebRTC transports.
* Create JSON Schema library for all tools the LLM is allowed to call; ensure Orchestrator validates and logs all tool requests.
* Define retention policy & UI affordance for audio and transcripts.

---

## Appendix A — Example prompt template (LLM)

```
SYSTEM: You are Vibe Planner assistant. You have access to the planner DB via a small set of tool calls and must not invent actions. Follow the JSON tool schema exactly when issuing an action. Use concise, friendly tone.

PLANNER_FACTS: { "routines": [...], "time_zone": "Asia/Kolkata", "energy_profile": {...}}

USER: "{transcript}"

INSTRUCTION: Decide intent. If action needed, return a JSON tool call. Otherwise return a short textual response.

OUTPUT_SCHEMA: Either {"response_text": "..."} OR {"tool": "<name>", "args": { ... }}
```

---

## Appendix B — Example tool JSON schema (create_task)

```json
{
  "$id": "https://vibeplanner.app/schemas/create_task.json",
  "type": "object",
  "required": ["title","date"],
  "properties": {
    "title": {"type": "string"},
    "date": {"type": "string", "format": "date"},
    "duration_minutes": {"type": "integer", "minimum": 5}
  }
}
```

---

*End of document.*
