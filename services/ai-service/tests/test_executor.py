"""Unit tests for the executor module."""

import pytest

from src.framework.executor import execute_agent
from src.framework.registry import AgentRegistry
from src.framework.base import BaseAgent
from google.adk.agents import Agent
from pydantic import BaseModel


class SimpleOutput(BaseModel):
    """Simple output schema for testing."""
    message: str


class SimpleTestAgent(BaseAgent):
    """Simple agent for testing executor."""

    @property
    def name(self) -> str:
        return "test_executor_agent"

    @property
    def description(self) -> str:
        return "Test agent for executor"

    @property
    def output_schema(self) -> type[BaseModel]:
        return SimpleOutput

    def get_adk_agent(self) -> Agent:
        return Agent(
            name=self.name,
            model="gemini-2.0-flash",
            description=self.description,
            instruction="Respond with JSON: {\"message\": \"test\"}",
            output_schema=SimpleOutput,
        )


class TestExecutor:
    """Tests for the execute_agent function."""

    def setup_method(self):
        """Clear registry before each test."""
        AgentRegistry.clear()

    def teardown_method(self):
        """Clear registry after each test."""
        AgentRegistry.clear()

    @pytest.mark.asyncio
    async def test_execute_nonexistent_agent(self):
        """Test executing a non-existent agent returns error response."""
        response = await execute_agent("nonexistent_agent", {})
        
        assert response.status == "cannot_proceed"
        assert response.agent_name == "nonexistent_agent"
        assert "not found" in response.reason.lower()

    @pytest.mark.asyncio
    async def test_execute_returns_agent_response_structure(self):
        """Test that execute returns proper AgentResponse structure."""
        # Register a test agent
        AgentRegistry.register(SimpleTestAgent())
        
        # Execute (this will fail without actual API key, but we test the structure)
        response = await execute_agent("test_executor_agent", {"test": "data"})
        
        # Should have proper structure regardless of success/failure
        assert response.agent_name == "test_executor_agent"
        assert response.status in ["success", "cannot_proceed"]

    def test_execute_agent_is_async(self):
        """Verify execute_agent is an async function."""
        import asyncio
        
        assert asyncio.iscoroutinefunction(execute_agent)
