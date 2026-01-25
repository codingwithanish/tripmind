# AI Service

Python-based AI execution framework using Google ADK for intelligent travel planning.

## Overview

This service provides a stateless AI execution framework that:
- Hosts hard-coded AI agents with fixed system prompts
- Executes agents via Google ADK
- Returns strictly structured JSON responses
- Exposes a RESTful API for agent execution

## Tech Stack

- Python 3.11+
- Google ADK (Agent Development Kit)
- FastAPI
- Pydantic

## Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -e .

# Install dev dependencies
pip install -e ".[dev]"

# Copy environment file
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

## Running the Service

```bash
# Development mode
uvicorn src.api.main:app --reload --port 8001

# Production mode
uvicorn src.api.main:app --host 0.0.0.0 --port 8001
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/agents` | List available agents |
| POST | `/execute` | Execute an agent |

## Execute Request Format

```json
{
  "agent_name": "itinerary_generator",
  "input_payload": {
    "destination": "Paris",
    "duration_days": 3,
    "interests": ["art", "food"]
  }
}
```

## Response Format

All responses follow the standard envelope:

```json
{
  "status": "success",
  "agent_name": "itinerary_generator",
  "output": { ... }
}
```

Error responses:

```json
{
  "status": "cannot_proceed",
  "agent_name": "itinerary_generator",
  "reason": "Invalid input",
  "missing_or_invalid_fields": ["destination"]
}
```

## Adding New Agents

1. Create a new folder in `src/agents/<agent_name>/`
2. Define the agent in `agent.py` with:
   - Hard-coded system prompt
   - Output schema (Pydantic model)
   - Optional tools in `tools/` subfolder
   - Optional sub-agents in `sub_agents/` subfolder
3. Register the agent in `src/agents/__init__.py`

## Testing

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v
```
