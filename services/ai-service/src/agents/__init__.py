"""
Agents module - All AI agents are registered here.

Each agent lives in its own submodule and is registered 
automatically when this module is imported.
"""

from src.framework import AgentRegistry

# Import all agent modules to trigger registration
from .itinerary_agent import ItineraryAgent
from .recommender_agent import RecommenderAgent
from .activity_agent import ActivityAgent

# Create and register agent instances
_itinerary_agent = ItineraryAgent()
_recommender_agent = RecommenderAgent()
_activity_agent = ActivityAgent()

AgentRegistry.register(_itinerary_agent)
AgentRegistry.register(_recommender_agent)
AgentRegistry.register(_activity_agent)

__all__ = [
    "ItineraryAgent",
    "RecommenderAgent",
    "ActivityAgent",
]
