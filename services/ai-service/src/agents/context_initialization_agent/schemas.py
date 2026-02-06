"""Schema definitions for the Context Initialization Agent."""

from typing import List, Optional
from pydantic import BaseModel, Field


class MemberMeta(BaseModel):
    """Minimal metadata about a family member/travel companion."""
    id: str = Field(..., description="Member ID")
    name: str = Field(..., description="Member name")
    relation: Optional[str] = Field(None, description="Relation to user (e.g., spouse, child)")
    travel_interests: Optional[List[str]] = Field(None, description="Travel interests")
    special_requirements: Optional[List[str]] = Field(None, description="Special requirements like dietary, accessibility")


class UserProfile(BaseModel):
    """User profile information."""
    email: str = Field(..., description="User email")
    name: str = Field(..., description="User name")
    location: Optional[str] = Field(None, description="User's primary location")


class ExistingContext(BaseModel):
    """Previous thread context that might be reusable."""
    thread_id: str = Field(..., description="Previous thread ID")
    journey_context: Optional[str] = Field(None, description="Previous journey context")
    destination: Optional[str] = Field(None, description="Previous destination")
    budget: Optional[float] = Field(None, description="Previous budget")
    travellers_count: Optional[int] = Field(None, description="Number of travelers")


class ContextInitializationInput(BaseModel):
    """Input to the context initialization agent."""
    initial_message: str = Field(
        ...,
        description="The initial message/suggestion from the home page"
    )
    user_profile: Optional[UserProfile] = Field(
        None,
        description="User profile if logged in, None for anonymous"
    )
    members: List[MemberMeta] = Field(
        default_factory=list,
        description="List of user's family members/travel companions"
    )
    existing_contexts: List[ExistingContext] = Field(
        default_factory=list,
        description="Recent thread contexts that might have reusable information"
    )


class UserVariable(BaseModel):
    """A user variable extracted from the initial message."""
    field_name: str = Field(
        ..., 
        description="Name of the field, e.g., 'destination', 'number_of_travelers'"
    )
    value: str = Field(
        ..., 
        description="Value of the field, or 'NOT_AVAILABLE' if not mentioned"
    )
    type: str = Field(
        default="mandatory",
        description="Whether this field is mandatory or optional"
    )


class PlanSummary(BaseModel):
    """Initial travel plan summary."""
    travel_summary: str = Field(
        ..., 
        description="A short summary of the user's travel intent"
    )
    user_variables: List[UserVariable] = Field(
        default_factory=list,
        description="List of extracted user variables with their values"
    )


class TravellerDetail(BaseModel):
    """Details about a traveler for this trip."""
    member_id: str = Field(..., description="Member ID")
    name: str = Field(..., description="Traveler name")
    travel_history_context: Optional[str] = Field(None, description="Relevant travel history")
    special_notes: Optional[str] = Field(None, description="Special notes for this trip")


class ContextInitializationOutput(BaseModel):
    """Output from the context initialization agent."""
    # ThreadContext fields
    budget: Optional[float] = Field(
        None, 
        description="Extracted budget amount if mentioned in the message"
    )
    currency: str = Field(
        default="USD",
        description="Currency code extracted or defaulted to USD"
    )
    start_date: Optional[str] = Field(
        None,
        description="Travel start date if mentioned (ISO format YYYY-MM-DD)"
    )
    end_date: Optional[str] = Field(
        None,
        description="Travel end date if mentioned (ISO format YYYY-MM-DD)"
    )
    plan_summary: PlanSummary = Field(
        ...,
        description="Initial plan summary with extracted variables"
    )
    travellers_details: List[TravellerDetail] = Field(
        default_factory=list,
        description="Suggested travelers based on message and members"
    )
    journey_context: str = Field(
        ...,
        description="Extracted context/summary from the initial message"
    )
    general_instructions: List[str] = Field(
        default_factory=list,
        description="Any special requirements or preferences mentioned"
    )
    user_actions: List[str] = Field(
        default_factory=list,
        description="Suggested next actions for the user"
    )
    
    # Response fields
    followup_question: str = Field(
        ...,
        description="The follow-up question to ask the user"
    )
    response_message: str = Field(
        ...,
        description="Complete response message to the user (markdown formatted)"
    )
    reused_context_from: Optional[str] = Field(
        None,
        description="Thread ID from which context was reused, if any"
    )
