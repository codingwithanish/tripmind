"""Base agent protocol for all AI agents."""

from abc import ABC, abstractmethod
from typing import Any

from google.adk.agents import Agent
from pydantic import BaseModel


class BaseAgent(ABC):
    """
    Abstract base class for all AI agents.
    
    Each agent implementation must:
    - Define a unique name
    - Provide a description
    - Return a configured Google ADK Agent instance
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique identifier for this agent."""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description of what this agent does."""
        ...

    @property
    @abstractmethod
    def output_schema(self) -> type[BaseModel]:
        """Pydantic model defining the output structure."""
        ...

    @abstractmethod
    def get_adk_agent(self) -> Agent:
        """
        Returns the configured Google ADK Agent instance.
        
        The returned Agent should have:
        - Hard-coded system prompt via `instruction`
        - Output schema via `output_schema`
        - Optional tools via `tools`
        - Optional sub-agents via `sub_agents`
        """
        ...

    def format_input(self, payload: dict[str, Any]) -> str:
        """
        Format the input payload as a string for the agent.
        
        Override this method to customize input formatting.
        Default implementation converts the payload to a JSON-like string.
        """
        import json
        return json.dumps(payload, indent=2)
