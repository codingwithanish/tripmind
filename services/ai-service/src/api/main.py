"""FastAPI application for the AI execution service."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import os

from src.framework import (
    AgentRegistry,
    AgentResponse,
    ExecuteRequest,
    execute_agent,
)
from src.framework.schemas import AgentInfo

# Import agents to trigger registration
from src import agents  # noqa: F401

# Configure logging with level from environment variable
log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("Starting AI Service...")
    
    # Log API key status (masked for security)
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    if api_key:
        masked_key = f"{api_key[:8]}...{api_key[-4:]}" if len(api_key) > 12 else "***"
        logger.debug(f"GOOGLE_API_KEY is set: {masked_key}")
    else:
        logger.warning("GOOGLE_API_KEY is NOT set!")
    
    registered = AgentRegistry.list_agents()
    logger.info(f"Registered agents: {registered}")
    yield
    logger.info("Shutting down AI Service...")


app = FastAPI(
    title="TripMind AI Service",
    description="Stateless AI execution framework using Google ADK",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Utility"])
async def health_check() -> dict:
    """Check service health."""
    return {"status": "healthy"}


@app.get("/agents", response_model=list[AgentInfo], tags=["Agents"])
async def list_agents() -> list[AgentInfo]:
    """List all available agents."""
    agents_dict = AgentRegistry.get_all()
    return [
        AgentInfo(name=agent.name, description=agent.description)
        for agent in agents_dict.values()
    ]


@app.post("/execute", response_model=AgentResponse, tags=["Execution"])
async def execute(request: ExecuteRequest) -> AgentResponse:
    """
    Execute an agent with the given input payload.
    
    This is the single entrypoint for all agent executions.
    Returns a structured JSON response with either:
    - Success: `status: "success"` with `output`
    - Failure: `status: "cannot_proceed"` with `reason`
    """
    return await execute_agent(
        agent_name=request.agent_name,
        input_payload=request.input_payload,
    )
