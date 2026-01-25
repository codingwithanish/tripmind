"""Response envelope and request schemas for the AI execution framework."""

from typing import Literal, Any

from pydantic import BaseModel, Field


class ExecuteRequest(BaseModel):
    """Request payload for agent execution."""

    agent_name: str = Field(
        ...,
        description="Name of the agent to execute",
        examples=["itinerary_generator", "destination_recommender"],
    )
    input_payload: dict[str, Any] = Field(
        default_factory=dict,
        description="Input data for the agent as a JSON object",
    )


class AgentResponse(BaseModel):
    """Standard response envelope for all agent executions."""

    status: Literal["success", "cannot_proceed"] = Field(
        ...,
        description="Execution status",
    )
    agent_name: str = Field(
        ...,
        description="Name of the agent that was executed",
    )
    output: dict[str, Any] | None = Field(
        default=None,
        description="Agent output (present when status is 'success')",
    )
    reason: str | None = Field(
        default=None,
        description="Failure reason (present when status is 'cannot_proceed')",
    )
    missing_or_invalid_fields: list[str] | None = Field(
        default=None,
        description="List of problematic fields (present on validation errors)",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "success",
                    "agent_name": "itinerary_generator",
                    "output": {"title": "Paris Adventure", "days": []},
                },
                {
                    "status": "cannot_proceed",
                    "agent_name": "itinerary_generator",
                    "reason": "Missing required field",
                    "missing_or_invalid_fields": ["destination"],
                },
            ]
        }
    }


class AgentInfo(BaseModel):
    """Information about a registered agent."""

    name: str = Field(..., description="Agent identifier")
    description: str = Field(..., description="Agent description")
