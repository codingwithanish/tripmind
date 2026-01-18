# TripMind Architecture Overview

## System Overview

TripMind is a travel planning application built as a monorepo with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                      Web UI (React)                         │
│                     apps/web-ui                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Service                              │
│                 services/api-service                         │
│              (Express + TypeScript)                          │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             ▼                                ▼
┌────────────────────────┐    ┌───────────────────────────────┐
│     AI Service         │    │    Integration Service        │
│  services/ai-service   │    │ services/integration-service  │
│   (Python/LangGraph)   │    │      (Python/FastAPI)         │
└────────────────────────┘    └───────────────────────────────┘
```

## Services

### Web UI (`apps/web-ui`)
- React + Vite + TypeScript
- Handles user interface and interactions
- Communicates with API Service via REST and WebSocket

### API Service (`services/api-service`)
- Express.js + TypeScript
- Main backend API
- Handles authentication, data management
- Orchestrates AI and integration services

### AI Service (`services/ai-service`)
- Python + LangGraph
- Handles NLP and AI-powered features
- *Planned implementation*

### Integration Service (`services/integration-service`)
- Python + FastAPI
- Third-party API integrations
- *Planned implementation*

## Shared Packages

All packages are TypeScript-based with no runtime dependencies between services.

| Package | Purpose |
|---------|---------|
| `@tripmind/shared-types` | API contracts and schemas |
| `@tripmind/shared-utils` | Logging, errors, tracing |
| `@tripmind/shared-config` | Environment and config |
| `@tripmind/auth-lib` | JWT and RBAC helpers |

## Data Flow

1. User interacts with Web UI
2. Web UI sends requests to API Service
3. API Service processes request, may call AI or Integration services
4. Response flows back through the stack

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript |
| API | Express.js, TypeScript |
| AI | Python, LangGraph |
| Database | MongoDB |
| Real-time | Socket.IO |
| Auth | JWT, Passport.js |
