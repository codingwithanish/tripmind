from pydantic import BaseModel, Field
from typing import List, Optional

class SuggestionInput(BaseModel):
    location: str
    screen_type: str = Field(description="mobile or desktop")
    count: int = 4

class PlaceholderOption(BaseModel):
    value: str

    type: str
    required: bool = True
    options: List[PlaceholderOption]

class SuggestionItem(BaseModel):
    id: str
    order: int
    template_text: str
    description: str
    category: str
    placeholders: dict[str, Placeholder]

class SuggestionOutput(BaseModel):
    suggestions: List[SuggestionItem]
