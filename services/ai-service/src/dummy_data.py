"""
Dummy data provider for testing purposes.

This module provides mock responses for all agents when running in dummy mode.
Add new agent responses here to enable testing without actual AI calls.
"""

from typing import Any


# Dummy responses for each agent
DUMMY_RESPONSES: dict[str, dict[str, Any]] = {
    "context_initialization_agent": {
        "budget": 5000,
        "currency": "USD",
        "start_date": "2026-03-15",
        "end_date": "2026-03-22",
        "plan_summary": {
            "travel_summary": "Planning a relaxing beach vacation",
            "user_variables": [
                {"field_name": "destination", "value": "NOT_AVAILABLE", "type": "mandatory"},
                {"field_name": "travel_dates", "value": "March 2026", "type": "mandatory"},
                {"field_name": "number_of_travelers", "value": "NOT_AVAILABLE", "type": "mandatory"},
                {"field_name": "budget_range", "value": "mid-range (~$5000)", "type": "mandatory"},
            ]
        },
        "travellers_details": [],
        "journey_context": "User is planning a vacation. Details being collected.",
        "general_instructions": [],
        "user_actions": ["specify destination", "confirm number of travelers"],
        "followup_question": "Where would you like to go for your vacation?",
        "response_message": "I'd love to help you plan your trip! 🌴\n\nTo get started, **where would you like to travel to?**",
        "reused_context_from": None
    },
    
    "travel_planning_agent": {
        "plan_updated": True,
        "plan_summary": {
            "travel_summary": "Planning a trip based on user preferences",
            "user_variables": [
                {"field_name": "destination", "value": "NOT_AVAILABLE", "type": "mandatory"},
                {"field_name": "travel_dates", "value": "NOT_AVAILABLE", "type": "mandatory"},
                {"field_name": "number_of_travelers", "value": "NOT_AVAILABLE", "type": "mandatory"},
                {"field_name": "budget", "value": "NOT_AVAILABLE", "type": "mandatory"},
            ]
        },
        "plan_ready": False,
        "next_question": "When would you like to travel?",
        "response_message": "Great! I'm gathering information for your trip. When are you planning to travel?",
        "is_irrelevant_input": False
    },
    
    "timeline_generation_agent": {
        "timeline": {
            "title": "Your Trip Timeline",
            "days": [
                {
                    "day_number": 1,
                    "date": "2026-03-15",
                    "title": "Arrival Day",
                    "activities": [
                        {
                            "type": "transport",
                            "title": "Airport Arrival",
                            "time": "10:00 AM",
                            "description": "Arrive at destination airport"
                        },
                        {
                            "type": "accommodation",
                            "title": "Hotel Check-in",
                            "time": "2:00 PM",
                            "description": "Check into your hotel"
                        }
                    ]
                }
            ]
        },
        "summary": "A sample 7-day itinerary has been generated.",
        "total_days": 7
    },
    
    "suggestion_agent": {
        "suggestions": [
            {
                "id": "sug_1",
                "title": "Beach Getaway",
                "description": "Relax on pristine beaches",
                "icon": "beach",
                "category": "relaxation"
            },
            {
                "id": "sug_2",
                "title": "Mountain Adventure",
                "description": "Explore scenic mountain trails",
                "icon": "mountain",
                "category": "adventure"
            },
            {
                "id": "sug_3",
                "title": "City Explorer",
                "description": "Discover urban attractions",
                "icon": "city",
                "category": "cultural"
            }
        ]
    },
    
    "itinerary_agent": {
        "itinerary": {
            "destination": "Sample Destination",
            "duration": "7 days",
            "highlights": ["Activity 1", "Activity 2", "Activity 3"]
        }
    },
    
    "recommender_agent": {
        "recommendations": [
            {"name": "Sample Place 1", "type": "attraction", "rating": 4.5},
            {"name": "Sample Place 2", "type": "restaurant", "rating": 4.2}
        ]
    },
    
    "activity_agent": {
        "activities": [
            {"name": "Sample Activity", "duration": "2 hours", "cost": "$50"}
        ]
    }
}


def get_dummy_response(agent_name: str) -> dict[str, Any] | None:
    """
    Get dummy response for a given agent.
    
    Args:
        agent_name: Name of the agent
        
    Returns:
        Dummy response dict or None if not found
    """
    return DUMMY_RESPONSES.get(agent_name)


def has_dummy_response(agent_name: str) -> bool:
    """Check if dummy response exists for an agent."""
    return agent_name in DUMMY_RESPONSES
