# Integration Service

Python service for third-party API integrations.

## Overview

The Integration Service manages all external API connections:
- Travel booking platforms
- Hotel/accommodation providers
- Flight search services
- Maps and geolocation
- Weather data

## Location

`services/integration-service/`

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI (planned)
- **HTTP Client**: httpx (async)

## Status

🚧 **Planned** - Not yet implemented

## Planned Integrations

- [ ] Flight search API
- [ ] Hotel booking API
- [ ] Google Maps/Places API
- [ ] Weather API
- [ ] Currency exchange API

## Development

```bash
cd services/integration-service
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
