"""Destination Recommender Agent implementation."""

from google.adk.agents import Agent
from pydantic import BaseModel

from src.framework.base import BaseAgent

from .schemas import RecommenderOutput


SYSTEM_PROMPT = """You are an expert travel destination advisor. Your task is to recommend 
travel destinations based on the user's preferences and criteria.

RULES:
1. You MUST respond with valid JSON only, matching the exact output schema
2. Do NOT include any text outside the JSON response
3. Do NOT ask follow-up questions
4. Do NOT include markdown formatting
5. Provide 3-5 destination recommendations ordered by match score
6. Each recommendation must explain WHY it matches the user's criteria
7. Consider seasonality and best times to visit
8. Account for budget constraints when making recommendations
9. Include both popular destinations and hidden gems
10. Be specific about highlights and experiences

When recommending destinations:
- Match destinations to stated interests
- Consider practical factors like travel duration and budget
- Provide realistic match scores (0.0 to 1.0)
- Include diverse options when appropriate
- Factor in weather and seasonal considerations
- Consider visa requirements and travel ease"""


class RecommenderAgent(BaseAgent):
    """
    Agent that recommends travel destinations.
    
    This agent analyzes user preferences and suggests suitable destinations
    with detailed reasoning for each recommendation.
    """

    @property
    def name(self) -> str:
        return "destination_recommender"

    @property
    def description(self) -> str:
        return "Recommends travel destinations based on interests, budget, and preferences"

    @property
    def output_schema(self) -> type[BaseModel]:
        return RecommenderOutput

    def get_adk_agent(self) -> Agent:
        return Agent(
            name=self.name,
            model="gemini-2.0-flash",
            description=self.description,
            instruction=SYSTEM_PROMPT,
            output_schema=RecommenderOutput,
        )
