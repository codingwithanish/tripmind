# AI Service

Python-based AI service for intelligent travel planning.

## Overview

The AI Service handles all AI/ML-powered features:
- Natural language understanding for travel queries
- Itinerary generation and optimization
- Personalized recommendations
- Conversational AI interactions

## Location

`services/ai-service/`

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI (planned)
- **AI**: LangGraph, LangChain
- **LLM**: OpenAI / Anthropic

## Status

🚧 **Planned** - Not yet implemented

## Planned Features

- [ ] Travel query understanding
- [ ] Itinerary generation
- [ ] Activity recommendations
- [ ] Budget optimization
- [ ] Conversational planning

## Development

```bash
cd services/ai-service
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
