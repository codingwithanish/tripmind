"""Schemas for the Destination Recommender Agent."""

from pydantic import BaseModel, Field


class Destination(BaseModel):
    """A recommended destination."""

    name: str = Field(..., description="Name of the destination")
    country: str = Field(..., description="Country where the destination is located")
    description: str = Field(..., description="Brief description of the destination")
    best_time_to_visit: str | None = Field(
        None,
        description="Best season or months to visit",
    )
    highlights: list[str] = Field(
        default_factory=list,
        description="Top attractions or experiences",
    )
    average_daily_budget: float | None = Field(
        None,
        description="Average daily budget in USD",
    )
    travel_duration_recommended: str | None = Field(
        None,
        description="Recommended trip duration (e.g., '4-5 days')",
    )
    why_recommended: str = Field(
        ...,
        description="Why this destination matches the user's criteria",
    )
    match_score: float = Field(
        ...,
        description="How well this matches preferences (0.0 to 1.0)",
        ge=0.0,
        le=1.0,
    )


class RecommenderOutput(BaseModel):
    """Output schema for the Destination Recommender Agent."""

    recommendations: list[Destination] = Field(
        ...,
        description="List of recommended destinations, ordered by match score",
    )
    search_criteria_summary: str = Field(
        ...,
        description="Summary of the criteria used for recommendations",
    )
    additional_considerations: list[str] | None = Field(
        None,
        description="Additional factors to consider when choosing",
    )


class RecommenderInput(BaseModel):
    """Input schema for the Destination Recommender Agent."""

    interests: list[str] = Field(
        ...,
        description="User interests (e.g., 'beaches', 'history', 'food')",
    )
    budget: str | None = Field(
        None,
        description="Budget level ('budget', 'moderate', 'luxury')",
    )
    travel_month: str | None = Field(
        None,
        description="Preferred month or season to travel",
    )
    trip_duration: str | None = Field(
        None,
        description="Expected trip duration (e.g., '1 week', '3-4 days')",
    )
    avoid: list[str] | None = Field(
        None,
        description="Things to avoid (e.g., 'crowds', 'extreme heat')",
    )
    departure_region: str | None = Field(
        None,
        description="Where the traveler is coming from",
    )
