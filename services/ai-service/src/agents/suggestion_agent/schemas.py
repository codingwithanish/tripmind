from pydantic import BaseModel, Field
from typing import List, Optional

class SuggestionInput(BaseModel):
    location: str
    screen_type: str = Field(description="mobile or desktop")
    count: int = 4

class Placeholder(BaseModel):
    name: str  # The placeholder name, e.g. "trip_type", "duration"
    type: str
    required: bool = True
    options: List[str]

class SuggestionItem(BaseModel):
    id: str
    order: int
    template_text: str
    description: str
    category: str
    placeholders: List[Placeholder]  # Changed from dict to list for Gemini API compatibility

class SuggestionOutput(BaseModel):
    suggestions: List[SuggestionItem]
