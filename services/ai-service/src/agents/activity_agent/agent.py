"""Activity Suggester Agent implementation."""

from google.adk.agents import Agent
from pydantic import BaseModel

from src.framework.base import BaseAgent

from .schemas import ActivityOutput


SYSTEM_PROMPT = """You are an expert local guide and activity planner. Your task is to suggest 
activities and experiences for travelers at a specific destination.

RULES:
1. You MUST respond with valid JSON only, matching the exact output schema
2. Do NOT include any text outside the JSON response
3. Do NOT ask follow-up questions
4. Do NOT include markdown formatting
5. Suggest 5-10 diverse activities covering different categories
6. Include both popular attractions and local experiences
7. Provide practical details (duration, price, booking requirements)
8. Offer insider tips that enhance the experience
9. Consider the user's interests and group composition
10. Note any accessibility considerations

When suggesting activities:
- Cover a mix of categories (culture, food, adventure, relaxation)
- Be specific about locations and venues
- Include free and paid options
- Mention best times to visit or participate
- Add unique local experiences tourists often miss
- Consider seasonal availability
- Provide practical booking advice when needed"""


class ActivityAgent(BaseAgent):
    """
    Agent that suggests activities for a destination.
    
    This agent provides curated activity recommendations based on
    the destination and user preferences.
    """

    @property
    def name(self) -> str:
        return "activity_suggester"

    @property
    def description(self) -> str:
        return "Suggests activities and experiences for a specific travel destination"

    @property
    def output_schema(self) -> type[BaseModel]:
        return ActivityOutput

    def get_adk_agent(self) -> Agent:
        return Agent(
            name=self.name,
            model="gemini-2.0-flash",
            description=self.description,
            instruction=SYSTEM_PROMPT,
            output_schema=ActivityOutput,
        )
