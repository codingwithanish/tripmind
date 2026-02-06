"""Configuration settings for the AI service."""

import os
from enum import Enum


class ExecutionMode(str, Enum):
    """Execution mode for the AI service."""
    ACTUAL = "actual"
    DUMMY = "dummy"


def get_execution_mode() -> ExecutionMode:
    """
    Get the execution mode from environment variable.
    
    Set AI_EXECUTION_MODE=dummy to use mock data for testing.
    Default is 'actual' which uses real AI agents.
    """
    mode = os.environ.get("AI_EXECUTION_MODE", "actual").lower()
    if mode == "dummy":
        return ExecutionMode.DUMMY
    return ExecutionMode.ACTUAL


def is_dummy_mode() -> bool:
    """Check if running in dummy mode."""
    return get_execution_mode() == ExecutionMode.DUMMY
