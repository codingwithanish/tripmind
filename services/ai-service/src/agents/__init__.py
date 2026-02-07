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
from .suggestion_agent import SuggestionAgent
from .travel_planning_agent import TravelPlanningAgent
from .timeline_generation_agent import TimelineGenerationAgent
from .context_initialization_agent import ContextInitializationAgent
from .search_agent import SearchAgent

# Create and register agent instances
_itinerary_agent = ItineraryAgent()
_recommender_agent = RecommenderAgent()
_activity_agent = ActivityAgent()
_suggestion_agent = SuggestionAgent()
_travel_planning_agent = TravelPlanningAgent()
_timeline_generation_agent = TimelineGenerationAgent()
_context_initialization_agent = ContextInitializationAgent()
_search_agent = SearchAgent()

AgentRegistry.register(_itinerary_agent)
AgentRegistry.register(_recommender_agent)
AgentRegistry.register(_activity_agent)
AgentRegistry.register(_suggestion_agent)
AgentRegistry.register(_travel_planning_agent)
AgentRegistry.register(_timeline_generation_agent)
AgentRegistry.register(_context_initialization_agent)
AgentRegistry.register(_search_agent)

__all__ = [
    "ItineraryAgent",
    "RecommenderAgent",
    "ActivityAgent",
    "SuggestionAgent",
    "TravelPlanningAgent",
    "TimelineGenerationAgent",
    "ContextInitializationAgent",
    "SearchAgent",
]

