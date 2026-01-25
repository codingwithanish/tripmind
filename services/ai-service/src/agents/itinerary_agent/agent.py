"""Itinerary Generator Agent implementation."""

from google.adk.agents import Agent
from pydantic import BaseModel

from src.framework.base import BaseAgent

from .schemas import ItineraryOutput
from .tools import get_weather_forecast, search_attractions, get_travel_advisory


SYSTEM_PROMPT = """You are an expert travel itinerary planner. Your task is to create detailed, 
practical travel itineraries based on the user's preferences.

RULES:
1. You MUST respond with valid JSON only, matching the exact output schema
2. Do NOT include any text outside the JSON response
3. Do NOT ask follow-up questions
4. Do NOT include markdown formatting
5. Create realistic, actionable itineraries with specific times and places
6. Consider the user's interests, budget, and travel style
7. Include a mix of popular attractions and local hidden gems
8. Suggest appropriate meal options for each day
9. Account for travel time between locations
10. Provide practical tips relevant to the destination

When generating the itinerary:
- Morning activities should start around 9:00 AM
- Include lunch break around 12:00-1:00 PM  
- Afternoon activities from 2:00-6:00 PM
- Dinner recommendations for evenings
- Ensure activities flow logically by location
- Consider opening hours and best times to visit

You have access to tools for weather forecasts, attraction search, and travel advisories.
Use these to enhance your recommendations when appropriate."""


class ItineraryAgent(BaseAgent):
    """
    Agent that generates detailed travel itineraries.
    
    This agent creates day-by-day travel plans based on user preferences
    including destination, duration, interests, and budget.
    """

    @property
    def name(self) -> str:
        return "itinerary_generator"

    @property
    def description(self) -> str:
        return "Generates detailed day-by-day travel itineraries based on destination, duration, and preferences"

    @property
    def output_schema(self) -> type[BaseModel]:
        return ItineraryOutput

    def get_adk_agent(self) -> Agent:
        return Agent(
            name=self.name,
            model="gemini-2.0-flash",
            description=self.description,
            instruction=SYSTEM_PROMPT,
            output_schema=ItineraryOutput,
            tools=[
                get_weather_forecast,
                search_attractions,
                get_travel_advisory,
            ],
        )
