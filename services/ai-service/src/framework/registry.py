"""Static agent registry for managing AI agents."""

from typing import ClassVar

from .base import BaseAgent


class AgentRegistry:
    """
    Central registry for all AI agents.
    
    This registry is static and initialized at startup.
    No dynamic agent loading is supported.
    """

    _agents: ClassVar[dict[str, BaseAgent]] = {}

    @classmethod
    def register(cls, agent: BaseAgent) -> None:
        """
        Register an agent in the registry.
        
        Args:
            agent: The agent instance to register
            
        Raises:
            ValueError: If an agent with the same name is already registered
        """
        if agent.name in cls._agents:
            raise ValueError(f"Agent '{agent.name}' is already registered")
        cls._agents[agent.name] = agent

    @classmethod
    def get(cls, name: str) -> BaseAgent | None:
        """
        Get an agent by name.
        
        Args:
            name: The agent name to look up
            
        Returns:
            The agent instance if found, None otherwise
        """
        return cls._agents.get(name)

    @classmethod
    def list_agents(cls) -> list[str]:
        """
        List all registered agent names.
        
        Returns:
            List of agent names
        """
        return list(cls._agents.keys())

    @classmethod
    def get_all(cls) -> dict[str, BaseAgent]:
        """
        Get all registered agents.
        
        Returns:
            Dictionary mapping agent names to agent instances
        """
        return cls._agents.copy()

    @classmethod
    def clear(cls) -> None:
        """
        Clear all registered agents.
        
        This is primarily useful for testing.
        """
        cls._agents.clear()
