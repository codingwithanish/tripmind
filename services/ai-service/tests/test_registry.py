"""Unit tests for the AgentRegistry."""

import pytest

from src.framework.base import BaseAgent
from src.framework.registry import AgentRegistry
from google.adk.agents import Agent
from pydantic import BaseModel


class MockOutputSchema(BaseModel):
    """Mock output schema for testing."""
    result: str


class MockAgent(BaseAgent):
    """Mock agent for testing."""

    def __init__(self, name: str = "mock_agent"):
        self._name = name

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return "A mock agent for testing"

    @property
    def output_schema(self) -> type[BaseModel]:
        return MockOutputSchema

    def get_adk_agent(self) -> Agent:
        return Agent(
            name=self.name,
            model="gemini-2.0-flash",
            description=self.description,
            instruction="You are a test agent.",
            output_schema=MockOutputSchema,
        )


class TestAgentRegistry:
    """Tests for AgentRegistry."""

    def setup_method(self):
        """Clear registry before each test."""
        AgentRegistry.clear()

    def teardown_method(self):
        """Clear registry after each test."""
        AgentRegistry.clear()

    def test_register_agent(self):
        """Test registering an agent."""
        agent = MockAgent("test_agent")
        AgentRegistry.register(agent)
        
        assert "test_agent" in AgentRegistry.list_agents()

    def test_register_duplicate_raises_error(self):
        """Test that registering duplicate agent raises ValueError."""
        agent1 = MockAgent("duplicate")
        agent2 = MockAgent("duplicate")
        
        AgentRegistry.register(agent1)
        
        with pytest.raises(ValueError, match="already registered"):
            AgentRegistry.register(agent2)

    def test_get_existing_agent(self):
        """Test getting an existing agent."""
        agent = MockAgent("existing")
        AgentRegistry.register(agent)
        
        retrieved = AgentRegistry.get("existing")
        
        assert retrieved is not None
        assert retrieved.name == "existing"

    def test_get_nonexistent_agent_returns_none(self):
        """Test getting a non-existent agent returns None."""
        result = AgentRegistry.get("nonexistent")
        
        assert result is None

    def test_list_agents_empty(self):
        """Test listing agents when registry is empty."""
        agents = AgentRegistry.list_agents()
        
        assert agents == []

    def test_list_agents_multiple(self):
        """Test listing multiple agents."""
        AgentRegistry.register(MockAgent("agent1"))
        AgentRegistry.register(MockAgent("agent2"))
        AgentRegistry.register(MockAgent("agent3"))
        
        agents = AgentRegistry.list_agents()
        
        assert len(agents) == 3
        assert "agent1" in agents
        assert "agent2" in agents
        assert "agent3" in agents

    def test_get_all(self):
        """Test getting all agents."""
        agent1 = MockAgent("first")
        agent2 = MockAgent("second")
        
        AgentRegistry.register(agent1)
        AgentRegistry.register(agent2)
        
        all_agents = AgentRegistry.get_all()
        
        assert len(all_agents) == 2
        assert "first" in all_agents
        assert "second" in all_agents

    def test_clear(self):
        """Test clearing the registry."""
        AgentRegistry.register(MockAgent("to_clear"))
        
        assert len(AgentRegistry.list_agents()) == 1
        
        AgentRegistry.clear()
        
        assert len(AgentRegistry.list_agents()) == 0
