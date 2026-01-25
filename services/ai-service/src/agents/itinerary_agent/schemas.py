"""Schemas for the Itinerary Generator Agent."""

from pydantic import BaseModel, Field


class Activity(BaseModel):
    """A single activity in the itinerary."""

    time: str = Field(..., description="Time of day (e.g., '9:00 AM', 'Morning')")
    name: str = Field(..., description="Name of the activity")
    description: str = Field(..., description="Brief description of the activity")
    location: str | None = Field(None, description="Location or venue name")
    duration_hours: float | None = Field(None, description="Estimated duration in hours")
    estimated_cost: float | None = Field(None, description="Estimated cost in USD")
    tips: str | None = Field(None, description="Helpful tips for this activity")


class DayPlan(BaseModel):
    """A single day's plan in the itinerary."""

    day_number: int = Field(..., description="Day number (1, 2, 3, etc.)")
    date: str | None = Field(None, description="Date if specified")
    theme: str | None = Field(None, description="Theme for the day (e.g., 'Art & Culture')")
    activities: list[Activity] = Field(
        default_factory=list,
        description="List of activities for this day",
    )
    meals: list[str] | None = Field(
        None,
        description="Recommended restaurants or meals",
    )


class ItineraryOutput(BaseModel):
    """Output schema for the Itinerary Generator Agent."""

    title: str = Field(..., description="Title of the itinerary")
    destination: str = Field(..., description="Main destination")
    duration_days: int = Field(..., description="Total number of days")
    summary: str = Field(..., description="Brief summary of the trip")
    days: list[DayPlan] = Field(
        default_factory=list,
        description="Day-by-day itinerary",
    )
    total_estimated_cost: float | None = Field(
        None,
        description="Total estimated cost for the trip in USD",
    )
    packing_suggestions: list[str] | None = Field(
        None,
        description="Suggested items to pack",
    )
    travel_tips: list[str] | None = Field(
        None,
        description="General travel tips for this destination",
    )


class ItineraryInput(BaseModel):
    """Input schema for the Itinerary Generator Agent."""

    destination: str = Field(..., description="Travel destination")
    duration_days: int = Field(..., description="Number of days for the trip")
    interests: list[str] | None = Field(
        None,
        description="User interests (e.g., 'art', 'food', 'adventure')",
    )
    budget: str | None = Field(
        None,
        description="Budget level ('budget', 'moderate', 'luxury')",
    )
    travel_style: str | None = Field(
        None,
        description="Travel style ('relaxed', 'active', 'balanced')",
    )
