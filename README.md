# Agentic Complaint Resolution Platform (agentic-cms-ui)

A standalone frontend implementing the **Agentic Architecture** — the fully-autonomous, 4-agent complaint resolution pipeline (Intake → Resolution → QA → Notification → Auto-Close / Human Escalation), as opposed to the human-in-the-loop flow in `sama-cms-ui`.

It is a companion app to [`sama-cms-ui`](../sama-cms-ui) and shares the same backend, [`rag-chat-ui/backend`](../rag-chat-ui/backend), via the `/api/agentic/*` endpoints.

## Architecture

```
Customer ──submit──▶ Intake Agent ──▶ Resolution Agent ──▶ QA Agent ──▶ Notification Agent
                       (classify,         (draft response,     (validate      (send response,
                        validate,          apply policy,        quality &      monitor for
                        create ticket)     auto-resolve          compliance)    satisfaction)
                                           simple cases)
                                                                                    │
                                                                     Customer Satisfied? ◀──┘
                                                                       │           │
                                                                      Yes          No
                                                                       │           │
                                                                       ▼           ▼
                                                                 Auto-Close   Human Escalation
                                                                              (L2 Specialist
                                                                               or CRA Authority)
```

Classification and response drafting are **grounded in past resolved tickets**, not keywords alone: the Intake Agent corroborates (or overrides) its keyword/LLM guess using how similar past `Auto-Closed` tickets were actually classified, and the Resolution Agent reuses a past ticket's actual response when a sufficiently similar precedent exists, only generating a fresh one otherwise. See `similar_case_ids` / `resolution_source` on each ticket and the "Grounded in Past Resolved Cases" panel in the Pipeline Monitor.

## Features

- **Submit Complaint** — customer intake form; the Intake Agent classifies the ticket immediately on submit.
- **Pipeline Monitor** — a live version of the Agentic Architecture diagram: highlights each agent node as it runs, shows the case-based-retrieval grounding, the full customer ⇄ agent conversation thread, the Customer Satisfied? decision (with an optional free-text reply), and the complete agent execution trace for compliance/audit.
- **Escalations** — queues for tickets a customer wasn't satisfied with, split by target: L2 Specialist (human review) vs. CRA Authority (direct regulatory escalation, for high-severity categories like fraud).

## Prerequisites

- Node.js 18+
- The backend running locally: `rag-chat-ui/backend` (`uvicorn app.main:app --port 8001`), which exposes the `/api/agentic/*` routes this app calls.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on **port 5176** (kept separate from `sama-cms-ui`'s 5175 so both can run side by side) and proxies `/api` requests to `http://localhost:8001`.

```bash
npm run build     # production build (tsc + vite build)
npm run preview   # preview the production build
```

## Project structure

```
src/
  App.tsx                        Top-level shell: tabs, ticket state, API calls
  types.ts                       AgentTicket / AgentStepLog types (mirrors backend models)
  components/
    CustomerIntake.tsx           Submit Complaint tab
    PipelineView.tsx             Pipeline Monitor tab (diagram, retrieval panel, thread, trace)
    EscalationQueue.tsx          Escalations tab (L2 / CRA queues)
```

## Backend endpoints used

| Method & path | Purpose |
|---|---|
| `POST /api/agentic/tickets/create` | Intake Agent: classify + create ticket |
| `POST /api/agentic/tickets/{id}/run-pipeline` | Run Resolution → QA → Notification |
| `POST /api/agentic/tickets/{id}/customer-response` | Apply the Customer Satisfied? decision |
| `GET /api/agentic/tickets` | List tickets (optionally `?stage=`) |
| `GET /api/agentic/tickets/{id}` | Ticket detail + full agent step trace |

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · lucide-react
