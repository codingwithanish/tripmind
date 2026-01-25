"""Error handling utilities for the AI execution framework."""

from typing import Any

from .schemas import AgentResponse


class AgentExecutionError(Exception):
    """Exception raised when agent execution fails."""

    def __init__(
        self,
        agent_name: str,
        reason: str,
        missing_or_invalid_fields: list[str] | None = None,
    ):
        self.agent_name = agent_name
        self.reason = reason
        self.missing_or_invalid_fields = missing_or_invalid_fields
        super().__init__(reason)

    def to_response(self) -> AgentResponse:
        """Convert this error to a structured AgentResponse."""
        return AgentResponse(
            status="cannot_proceed",
            agent_name=self.agent_name,
            reason=self.reason,
            missing_or_invalid_fields=self.missing_or_invalid_fields,
        )


class AgentNotFoundError(AgentExecutionError):
    """Exception raised when the requested agent does not exist."""

    def __init__(self, agent_name: str):
        super().__init__(
            agent_name=agent_name,
            reason=f"Agent '{agent_name}' not found in registry",
        )


class InvalidInputError(AgentExecutionError):
    """Exception raised when input validation fails."""

    def __init__(
        self,
        agent_name: str,
        missing_or_invalid_fields: list[str],
    ):
        super().__init__(
            agent_name=agent_name,
            reason="Invalid or missing input fields",
            missing_or_invalid_fields=missing_or_invalid_fields,
        )


class InvalidOutputError(AgentExecutionError):
    """Exception raised when agent output is not valid JSON."""

    def __init__(self, agent_name: str, details: str = ""):
        reason = "Agent produced invalid JSON output"
        if details:
            reason = f"{reason}: {details}"
        super().__init__(
            agent_name=agent_name,
            reason=reason,
        )


def create_error_response(
    agent_name: str,
    error: Exception,
) -> AgentResponse:
    """
    Create a structured error response from any exception.
    
    Args:
        agent_name: The agent that was being executed
        error: The exception that occurred
        
    Returns:
        A structured AgentResponse with 'cannot_proceed' status
    """
    if isinstance(error, AgentExecutionError):
        return error.to_response()

    # Handle unexpected errors
    return AgentResponse(
        status="cannot_proceed",
        agent_name=agent_name,
        reason=f"Unexpected error: {str(error)}",
    )
