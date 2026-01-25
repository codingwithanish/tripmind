"""Schemas for the Activity Suggester Agent."""

from pydantic import BaseModel, Field


class Activity(BaseModel):
    """A suggested activity."""

    name: str = Field(..., description="Name of the activity")
    category: str = Field(
        ...,
        description="Category (e.g., 'Sightseeing', 'Adventure', 'Food', 'Culture')",
    )
    description: str = Field(..., description="Detailed description of the activity")
    location: str | None = Field(None, description="Specific location or address")
    duration: str = Field(..., description="Estimated duration (e.g., '2-3 hours')")
    best_time: str | None = Field(
        None,
        description="Best time of day or week to do this activity",
    )
    price_range: str | None = Field(
        None,
        description="Price range ('Free', '$', '$$', '$$$')",
    )
    booking_required: bool = Field(
        False,
        description="Whether advance booking is recommended",
    )
    insider_tip: str | None = Field(
        None,
        description="Insider tip for this activity",
    )
    accessibility: str | None = Field(
        None,
        description="Accessibility information",
    )


class ActivityOutput(BaseModel):
    """Output schema for the Activity Suggester Agent."""

    destination: str = Field(..., description="The destination these activities are for")
    activities: list[Activity] = Field(
        ...,
        description="List of suggested activities",
    )
    grouped_by_category: dict[str, list[str]] | None = Field(
        None,
        description="Activity names grouped by category for quick reference",
    )
    local_customs_note: str | None = Field(
        None,
        description="Important local customs or etiquette to know",
    )


class ActivityInput(BaseModel):
    """Input schema for the Activity Suggester Agent."""

    destination: str = Field(..., description="The travel destination")
    interests: list[str] | None = Field(
        None,
        description="User interests to filter activities",
    )
    duration_available: str | None = Field(
        None,
        description="How much time available (e.g., 'half day', 'full day')",
    )
    group_type: str | None = Field(
        None,
        description="Type of group ('solo', 'couple', 'family', 'friends')",
    )
    mobility_requirements: str | None = Field(
        None,
        description="Any mobility or accessibility requirements",
    )
