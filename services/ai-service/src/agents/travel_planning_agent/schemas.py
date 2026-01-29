"""Schema definitions for the Travel Planning Agent."""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ConversationMessage(BaseModel):
    """A single message in the conversation history."""
    role: Literal["user", "assistant"] = Field(
        ..., description="The role of the message sender"
    )
    content: str = Field(..., description="The message content")


class UserVariable(BaseModel):
    """A user variable that needs to be collected for travel planning."""
    field_name: str = Field(
        ..., 
        description="Name of the field, e.g., 'visa status', 'number of travelers'"
    )
    value: str = Field(
        ..., 
        description="Value of the field, or 'NOT_AVAILABLE' if not yet provided"
    )
    type: Literal["mandatory", "optional"] = Field(
        ..., 
        description="Whether this field is mandatory or optional for the travel plan"
    )


class PlanSummary(BaseModel):
    """The complete travel plan summary with user variables."""
    travel_summary: str = Field(
        ..., 
        description="A short summary of the user's travel intent"
    )
    user_variables: List[UserVariable] = Field(
        default_factory=list,
        description="List of user variables with their values"
    )


class TravelPlanInput(BaseModel):
    """Input to the travel planning agent."""
    conversation_history: List[ConversationMessage] = Field(
        default_factory=list,
        description="Full conversation history between user and assistant"
    )
    current_plan_summary: Optional[PlanSummary] = Field(
        default=None,
        description="Current plan summary from the database, if it exists"
    )
    latest_user_message: str = Field(
        ...,
        description="The latest message from the user"
    )


class EvaluationOutput(BaseModel):
    """Output from the travel planning agent."""
    plan_updated: bool = Field(
        ..., 
        description="Whether the plan or any fields were modified in this call"
    )
    plan_summary: PlanSummary = Field(
        ..., 
        description="Full details of the travel plan, including summary and variables"
    )
    plan_ready: bool = Field(
        ..., 
        description="True if all mandatory fields are filled; false if more input needed"
    )
    next_question: str = Field(
        ..., 
        description="Next question to ask the user, or empty if plan is complete"
    )
    response_message: str = Field(
        ..., 
        description="The complete response message to send to the user"
    )
    is_irrelevant_input: bool = Field(
        default=False,
        description="True if the user's input was off-topic or irrelevant"
    )
