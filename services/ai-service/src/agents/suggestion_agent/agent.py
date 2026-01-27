"""Suggestion Agent implementation."""

from google.adk.agents import Agent
from google.adk.agents.readonly_context import ReadonlyContext
from pydantic import BaseModel

from src.framework.base import BaseAgent
from .schemas import SuggestionOutput

# Template with placeholders - we'll substitute {location} and {screen_type} manually
# Double braces {{variable_name}} are meant for the LLM to understand the output format
SYSTEM_PROMPT_TEMPLATE = """You are a creative travel assistant. Your task is to generate personalized travel suggestion templates based on a specific location.

INPUT CONTEXT:
- Location: {location}
- Screen Type: {screen_type} (determines text length)

REQUIREMENTS:
1. Generate exactly 4 suggestions, one for each of these categories:
   - "long_time_plan" (e.g. 10+ days)
   - "short_time_plan" (e.g. 4-9 days)
   - "weekend_plan" (e.g. 2-3 days)
   - "quick_trip" (e.g. day trip or overnight)

2. LENGTH CONSTRAINTS based on screen_type:
   - if screen_type is "mobile": 50 to 100 characters per template text.
   - if screen_type is "desktop": 150 to 200 characters per template text.

3. TEMPLATE TEXT FORMAT:
   - The text must be inspiring and concise.
   - You MUST use placeholders for variable parts.
   - Syntax: use double curly braces around variable names, e.g. the text "trip_type" wrapped in two opening braces and two closing braces
   - Example Mobile: "Enjoy a [trip_type placeholder] in the location with views."
   - Example Desktop: "Immerse yourself in the vibrant culture of the location for a [duration placeholder] day adventure, perfect for a [trip_type placeholder] seeking relaxation."
   - Bold important words using **text**.
   - Italicize mood/vibe using *text*.

4. PLACEHOLDERS:
   - For each suggestion, define the placeholders you used in the text.
   - "options" should be realistic choices for that specific suggestion.
   - "type" should clearly be "string".

OUTPUT FORMAT:
Return strictly a JSON object matching the SuggestionOutput schema.
"""


def instruction_provider(ctx: ReadonlyContext) -> str:
    """
    Instruction provider that manually substitutes session state variables.
    This prevents ADK from interpreting double braces in examples as template variables.
    """
    location = ctx.state.get("location", "Unknown location")
    screen_type = ctx.state.get("screen_type", "desktop")
    
    return SYSTEM_PROMPT_TEMPLATE.format(
        location=location,
        screen_type=screen_type
    )


class SuggestionAgent(BaseAgent):
    """
    Agent that generates travel suggestion templates for a specific location.
    
    Generates 4 templates (one per category) with length constraints based on device type.
    """

    @property
    def name(self) -> str:
        return "suggestion_agent"

    @property
    def description(self) -> str:
        return "Generates location-specific travel suggestion templates with dynamic placeholders"

    @property
    def output_schema(self) -> type[BaseModel]:
        return SuggestionOutput

    def get_adk_agent(self) -> Agent:
        return Agent(
            name=self.name,
            model="gemini-2.0-flash",
            description=self.description,
            instruction=instruction_provider,  # Use function instead of string
            output_schema=SuggestionOutput,
        )
