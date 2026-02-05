"""Schema definitions for the Timeline Generation Agent."""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# Reuse PlanSummary structure from travel_planning_agent
class UserVariable(BaseModel):
    """A user variable with its value."""
    field_name: str = Field(..., description="Name of the field")
    value: str = Field(..., description="Value of the field")
    type: Literal["mandatory", "optional"] = Field(..., description="Field type")


class PlanSummary(BaseModel):
    """The travel plan summary from thread context."""
    travel_summary: str = Field(..., description="Summary of the travel intent")
    user_variables: List[UserVariable] = Field(
        default_factory=list,
        description="List of user variables with their values"
    )


class TimelineGenerationInput(BaseModel):
    """Input to the timeline generation agent."""
    plan_summary: PlanSummary = Field(
        ..., description="The complete travel plan summary from thread context"
    )


# Output schemas matching timeline.types.ts structure
class DisplayDate(BaseModel):
    """Display date for a timeline node."""
    type: Literal["date", "date_range", "time", "time_range"] = Field(
        ..., description="Type of date display"
    )
    label: str = Field(..., description="Human-readable date label")
    start: str = Field(..., description="ISO 8601 datetime for start")
    end: Optional[str] = Field(None, description="ISO 8601 datetime for end (range types)")


class PriceInfo(BaseModel):
    """Price information for tasks and recommendations."""
    type: Literal["confirmed", "range", "constant"] = Field(
        ..., description="Price type"
    )
    unit: str = Field(..., description="Currency unit, e.g., USD, INR")
    confirmed_price: Optional[float] = Field(None, description="Confirmed price value")
    min: Optional[float] = Field(None, description="Minimum price for range")
    max: Optional[float] = Field(None, description="Maximum price for range")
    value: Optional[float] = Field(None, description="Constant price value")


class Task(BaseModel):
    """A task item within an action node."""
    priority: int = Field(..., description="Task priority (1 = highest)")
    title: str = Field(..., description="Task title")
    title_image: Optional[str] = Field(None, description="Icon name, e.g., mdi:airplane-takeoff")
    description: Optional[str] = Field(None, description="Task description")
    price: Optional[PriceInfo] = Field(None, description="Price information")


class Recommendation(BaseModel):
    """A recommendation within an action node."""
    type: Literal["restaurant", "place", "activity", "hotel", "flight"] = Field(
        ..., description="Recommendation type"
    )
    priority: int = Field(..., description="Recommendation priority")
    title: str = Field(..., description="Recommendation title")
    title_image: Optional[str] = Field(None, description="Icon name")
    description: Optional[str] = Field(None, description="Recommendation description")
    price_included: bool = Field(False, description="Whether price info is included")
    price_info: Optional[PriceInfo] = Field(None, description="Price information")


class Representation(BaseModel):
    """A representation item (weather, alert, info)."""
    title: str = Field(..., description="Representation title")
    description: Optional[str] = Field(None, description="Description text")
    icon: Optional[str] = Field(None, description="Icon name, e.g., mdi:weather-sunny")


class TimelineNodeOutput(BaseModel):
    """A single node in the timeline."""
    order: int = Field(..., description="Node order in timeline")
    type: Literal["start", "end", "action", "representation"] = Field(
        ..., description="Node type"
    )
    subtype: Optional[str] = Field(None, description="Node subtype if applicable")
    display_date: Optional[DisplayDate] = Field(None, description="Display date for the node")
    # For action nodes
    tasks: Optional[List[Task]] = Field(None, description="Tasks for action nodes")
    recommendations: Optional[List[Recommendation]] = Field(
        None, description="Recommendations for action nodes"
    )
    # For representation nodes
    representation: Optional[Representation] = Field(
        None, description="Representation data for representation nodes"
    )


class TimelineGenerationOutput(BaseModel):
    """Output from the timeline generation agent."""
    style: str = Field(
        default="default",
        description="Timeline rendering style"
    )
    configs: dict = Field(
        default_factory=lambda: {"display_price_unit": "USD", "timezone": "UTC"},
        description="Timeline configuration"
    )
    nodes: List[TimelineNodeOutput] = Field(
        ..., description="List of timeline nodes in order"
    )
