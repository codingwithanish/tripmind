"""
Dynamic dummy data provider for testing purposes.

This module provides context-aware mock responses based on conversation state.
Responses change based on what information has been collected from the user.
"""

from typing import Any


def get_travel_planning_dummy(input_payload: dict[str, Any]) -> dict[str, Any]:
    """
    Get context-aware travel planning response based on conversation history.
    Progressively collects: destination -> dates -> travelers -> budget -> interests
    """
    conversation = input_payload.get("conversation_history", [])
    current_summary = input_payload.get("current_plan_summary", {}) or {}
    user_vars = current_summary.get("user_variables", [])
    
    # Helper to check what fields are filled
    def get_field_value(field_name: str) -> str | None:
        for var in user_vars:
            if var.get("field_name") == field_name:
                val = var.get("value", "NOT_AVAILABLE")
                if val != "NOT_AVAILABLE":
                    return val
        return None
    
    # Analyze the latest user message for context
    latest_msg = ""
    for msg in reversed(conversation):
        if msg.get("role") == "user":
            latest_msg = msg.get("content", "").lower()
            break
    
    # Determine what stage we're at based on filled fields
    has_destination = get_field_value("destination") is not None
    has_dates = get_field_value("travel_dates") is not None
    has_travelers = get_field_value("number_of_travelers") is not None
    has_budget = get_field_value("budget") is not None
    
    # Parse latest message for new info (simple keyword detection)
    new_vars = list(user_vars) if user_vars else []
    detected_values = {}
    
    # Detect destination
    if "tokyo" in latest_msg or "japan" in latest_msg:
        detected_values["destination"] = "Tokyo, Japan"
    elif "paris" in latest_msg or "france" in latest_msg:
        detected_values["destination"] = "Paris, France"
    elif "bali" in latest_msg or "indonesia" in latest_msg:
        detected_values["destination"] = "Bali, Indonesia"
    
    # Detect dates
    if "march" in latest_msg:
        detected_values["travel_dates"] = "March 2026"
    elif "april" in latest_msg:
        detected_values["travel_dates"] = "April 2026"
    elif "next week" in latest_msg:
        detected_values["travel_dates"] = "Next week"
    elif "next month" in latest_msg:
        detected_values["travel_dates"] = "Next month"
    
    # Detect travelers
    if "family" in latest_msg or "kids" in latest_msg or "children" in latest_msg:
        detected_values["number_of_travelers"] = "4 (2 adults, 2 children)"
    elif "solo" in latest_msg or "just me" in latest_msg or "alone" in latest_msg:
        detected_values["number_of_travelers"] = "1 (solo traveler)"
    elif "couple" in latest_msg or "2 people" in latest_msg or "two of us" in latest_msg:
        detected_values["number_of_travelers"] = "2 (couple)"
    
    # Detect budget
    if "budget" in latest_msg and ("low" in latest_msg or "cheap" in latest_msg):
        detected_values["budget"] = "Budget (~$2000)"
    elif "luxury" in latest_msg or "high end" in latest_msg:
        detected_values["budget"] = "Luxury (~$15000+)"
    elif "mid" in latest_msg or "$5000" in latest_msg or "$8000" in latest_msg:
        detected_values["budget"] = "Mid-range (~$8000)"
    
    # Update variables with detected values
    field_map = {v.get("field_name"): i for i, v in enumerate(new_vars)}
    for field, value in detected_values.items():
        if field in field_map:
            new_vars[field_map[field]]["value"] = value
        else:
            new_vars.append({"field_name": field, "value": value, "type": "mandatory"})
    
    # Ensure all mandatory fields exist
    mandatory_fields = ["destination", "travel_dates", "number_of_travelers", "budget"]
    for field in mandatory_fields:
        if field not in field_map and field not in detected_values:
            new_vars.append({"field_name": field, "value": "NOT_AVAILABLE", "type": "mandatory"})
    
    # Recalculate what's filled
    def is_filled(field: str) -> bool:
        for v in new_vars:
            if v.get("field_name") == field and v.get("value") != "NOT_AVAILABLE":
                return True
        return False
    
    # Determine next question and response
    filled_count = sum(1 for f in mandatory_fields if is_filled(f))
    
    if not is_filled("destination"):
        # Stage 1: Ask for destination
        return {
            "plan_updated": True,
            "plan_summary": {
                "travel_summary": "Planning your trip...",
                "user_variables": new_vars
            },
            "plan_ready": False,
            "next_question": "Where would you like to travel to?",
            "response_message": "I'd love to help plan your trip! 🌍\n\nTo get started, **where would you like to travel to?**",
            "is_irrelevant_input": False
        }
    
    if not is_filled("travel_dates"):
        dest = next((v["value"] for v in new_vars if v["field_name"] == "destination"), "your destination")
        # Stage 2: Ask for dates
        return {
            "plan_updated": True,
            "plan_summary": {
                "travel_summary": f"Planning a trip to {dest}",
                "user_variables": new_vars
            },
            "plan_ready": False,
            "next_question": "When would you like to travel?",
            "response_message": f"Great choice! **{dest}** is wonderful! 🎌\n\n**When are you planning to travel?**",
            "is_irrelevant_input": False
        }
    
    if not is_filled("number_of_travelers"):
        dest = next((v["value"] for v in new_vars if v["field_name"] == "destination"), "your destination")
        dates = next((v["value"] for v in new_vars if v["field_name"] == "travel_dates"), "")
        # Stage 3: Ask for travelers
        return {
            "plan_updated": True,
            "plan_summary": {
                "travel_summary": f"Trip to {dest} in {dates}",
                "user_variables": new_vars
            },
            "plan_ready": False,
            "next_question": "How many people are traveling?",
            "response_message": f"Perfect! **{dates}** is a great time to visit!\n\n**How many people will be traveling?** (solo, couple, family, group?)",
            "is_irrelevant_input": False
        }
    
    if not is_filled("budget"):
        dest = next((v["value"] for v in new_vars if v["field_name"] == "destination"), "your destination")
        travelers = next((v["value"] for v in new_vars if v["field_name"] == "number_of_travelers"), "")
        # Stage 4: Ask for budget
        return {
            "plan_updated": True,
            "plan_summary": {
                "travel_summary": f"Trip to {dest} for {travelers}",
                "user_variables": new_vars
            },
            "plan_ready": False,
            "next_question": "What's your budget range?",
            "response_message": f"Wonderful! **{travelers}** sounds exciting!\n\n**What's your budget range?** (budget, mid-range, or luxury?)",
            "is_irrelevant_input": False
        }
    
    # All mandatory fields filled - plan is ready!
    dest = next((v["value"] for v in new_vars if v["field_name"] == "destination"), "")
    dates = next((v["value"] for v in new_vars if v["field_name"] == "travel_dates"), "")
    travelers = next((v["value"] for v in new_vars if v["field_name"] == "number_of_travelers"), "")
    budget = next((v["value"] for v in new_vars if v["field_name"] == "budget"), "")
    
    return {
        "plan_updated": True,
        "plan_summary": {
            "travel_summary": f"Trip to {dest} for {travelers}",
            "user_variables": new_vars
        },
        "plan_ready": True,
        "next_question": "",
        "response_message": f"""Perfect! 🎉 I have everything I need to create your travel plan!

**Your Trip Summary:**
- 📍 **Destination**: {dest}
- 📅 **When**: {dates}
- 👥 **Travelers**: {travelers}
- 💰 **Budget**: {budget}

Let me generate your detailed day-by-day timeline!""",
        "is_irrelevant_input": False
    }


def get_suggestion_dummy(input_payload: dict[str, Any]) -> dict[str, Any]:
    """
    Get context-aware suggestions based on what's been collected so far.
    Suggestions change based on what the next question is asking for.
    """
    next_question = input_payload.get("next_question", "").lower()
    progress = input_payload.get("progress", 0)
    
    # Destination suggestions
    if "where" in next_question or "destination" in next_question or "travel to" in next_question:
        return {
            "suggestions": [
                {"id": "sug_1", "label": "Tokyo, Japan", "value": "Tokyo, Japan for anime, tech, and culture", "icon": {"provider": "iconify", "name": "mdi:airplane"}, "type": "chip"},
                {"id": "sug_2", "label": "Paris, France", "value": "Paris, France for art, food, and romance", "icon": {"provider": "iconify", "name": "mdi:eiffel-tower"}, "type": "chip"},
                {"id": "sug_3", "label": "Bali, Indonesia", "value": "Bali, Indonesia for beaches and relaxation", "icon": {"provider": "iconify", "name": "mdi:beach"}, "type": "chip"},
            ]
        }
    
    # Date/timing suggestions
    if "when" in next_question or "date" in next_question or "time" in next_question:
        return {
            "suggestions": [
                {"id": "sug_1", "label": "This month", "value": "this month", "icon": {"provider": "iconify", "name": "mdi:calendar-today"}, "type": "chip"},
                {"id": "sug_2", "label": "Next month", "value": "next month", "icon": {"provider": "iconify", "name": "mdi:calendar-clock"}, "type": "chip"},
                {"id": "sug_3", "label": "Flexible", "value": "I'm flexible with dates", "icon": {"provider": "iconify", "name": "mdi:calendar-question"}, "type": "chip"},
            ]
        }
    
    # Traveler count suggestions
    if "how many" in next_question or "people" in next_question or "travelers" in next_question or "travelling" in next_question:
        return {
            "suggestions": [
                {"id": "sug_1", "label": "Solo", "value": "just me, solo travel", "icon": {"provider": "iconify", "name": "mdi:account"}, "type": "chip"},
                {"id": "sug_2", "label": "Couple", "value": "2 people, a couple", "icon": {"provider": "iconify", "name": "mdi:account-multiple"}, "type": "chip"},
                {"id": "sug_3", "label": "Family", "value": "family with 2 kids", "icon": {"provider": "iconify", "name": "mdi:account-group"}, "type": "chip"},
            ]
        }
    
    # Budget suggestions
    if "budget" in next_question or "spend" in next_question or "cost" in next_question:
        return {
            "suggestions": [
                {"id": "sug_1", "label": "Budget", "value": "budget-friendly, under $2000", "icon": {"provider": "iconify", "name": "mdi:cash"}, "type": "chip"},
                {"id": "sug_2", "label": "Mid-range", "value": "mid-range, around $5000-8000", "icon": {"provider": "iconify", "name": "mdi:cash-multiple"}, "type": "chip"},
                {"id": "sug_3", "label": "Luxury", "value": "luxury, no budget limit", "icon": {"provider": "iconify", "name": "mdi:star"}, "type": "chip"},
            ]
        }
    
    # Plan ready - show action suggestions
    if progress >= 100:
        return {
            "suggestions": [
                {"id": "sug_1", "label": "Generate Timeline", "value": "Generate my day-by-day timeline", "icon": {"provider": "iconify", "name": "mdi:calendar-check"}, "type": "chip"},
                {"id": "sug_2", "label": "Modify Plan", "value": "I want to modify some details", "icon": {"provider": "iconify", "name": "mdi:pencil"}, "type": "chip"},
            ]
        }
    
    # Default fallback
    return {
        "suggestions": [
            {"id": "sug_1", "label": "Help me plan", "value": "Help me plan my trip", "icon": {"provider": "iconify", "name": "mdi:help-circle"}, "type": "chip"},
        ]
    }


def get_timeline_dummy(input_payload: dict[str, Any]) -> dict[str, Any]:
    """
    Get timeline based on the plan summary context.
    """
    plan_summary = input_payload.get("plan_summary", {})
    user_vars = plan_summary.get("user_variables", [])
    
    # Extract destination for customization
    dest = "Your Destination"
    for v in user_vars:
        if v.get("field_name") == "destination":
            dest = v.get("value", "Your Destination")
            break
    
    # Return different timeline based on destination
    if "tokyo" in dest.lower() or "japan" in dest.lower():
        return {
            "timeline": {
                "title": f"7-Day {dest} Adventure",
                "days": [
                    {"day_number": 1, "date": "Day 1", "title": "Arrival & Shinjuku", "activities": [
                        {"type": "transport", "title": "Airport Arrival", "time": "10:00 AM", "description": "Clear customs, take train to hotel"},
                        {"type": "accommodation", "title": "Hotel Check-in", "time": "2:00 PM", "description": "Rest and recover from flight"},
                        {"type": "activity", "title": "Shinjuku Gyoen Garden", "time": "4:00 PM", "description": "Beautiful gardens, jet lag recovery"},
                    ]},
                    {"day_number": 2, "date": "Day 2", "title": "Akihabara Pop Culture", "activities": [
                        {"type": "activity", "title": "Akihabara Electric Town", "time": "9:00 AM", "description": "Gaming, anime, electronics paradise"},
                        {"type": "food", "title": "Themed Café", "time": "12:30 PM", "description": "Unique dining experience"},
                        {"type": "activity", "title": "teamLab Borderless", "time": "5:00 PM", "description": "Digital art museum"},
                    ]},
                    {"day_number": 3, "date": "Day 3", "title": "Traditional Tokyo", "activities": [
                        {"type": "activity", "title": "Senso-ji Temple", "time": "8:00 AM", "description": "Tokyo's oldest temple"},
                        {"type": "activity", "title": "Kimono Experience", "time": "11:00 AM", "description": "Traditional dress photo session"},
                        {"type": "activity", "title": "Tokyo Skytree", "time": "4:00 PM", "description": "360° city views"},
                    ]},
                ]
            },
            "summary": f"A wonderful itinerary exploring the best of {dest}!",
            "total_days": 7
        }
    
    # Default generic timeline
    return {
        "timeline": {
            "title": f"Trip to {dest}",
            "days": [
                {"day_number": 1, "date": "Day 1", "title": "Arrival Day", "activities": [
                    {"type": "transport", "title": "Airport Arrival", "time": "10:00 AM", "description": "Arrive and transfer to hotel"},
                    {"type": "accommodation", "title": "Hotel Check-in", "time": "2:00 PM", "description": "Settle in and rest"},
                    {"type": "activity", "title": "Explore Neighborhood", "time": "5:00 PM", "description": "Walk around, get oriented"},
                ]},
                {"day_number": 2, "date": "Day 2", "title": "Main Attractions", "activities": [
                    {"type": "activity", "title": "Top Attraction", "time": "9:00 AM", "description": "Visit the most famous site"},
                    {"type": "food", "title": "Local Lunch", "time": "12:30 PM", "description": "Try local cuisine"},
                    {"type": "activity", "title": "Cultural Experience", "time": "3:00 PM", "description": "Immerse in local culture"},
                ]},
            ]
        },
        "summary": f"Your personalized itinerary for {dest}!",
        "total_days": 7
    }


# Static responses for other agents that don't need context
STATIC_RESPONSES: dict[str, dict[str, Any]] = {
    "context_initialization_agent": {
        "budget": 0,
        "currency": "USD",
        "start_date": None,
        "end_date": None,
        "plan_summary": {
            "travel_summary": "Starting trip planning...",
            "user_variables": [
                {"field_name": "destination", "value": "NOT_AVAILABLE", "type": "mandatory"},
                {"field_name": "travel_dates", "value": "NOT_AVAILABLE", "type": "mandatory"},
                {"field_name": "number_of_travelers", "value": "NOT_AVAILABLE", "type": "mandatory"},
                {"field_name": "budget", "value": "NOT_AVAILABLE", "type": "mandatory"},
            ]
        },
        "travellers_details": [],
        "journey_context": "Starting new trip planning session",
        "general_instructions": [],
        "user_actions": [],
        "followup_question": "Where would you like to travel to?",
        "response_message": "Welcome! 🌍 I'd love to help plan your perfect trip!\n\n**Where would you like to travel to?**",
        "reused_context_from": None
    },
    
    "itinerary_agent": {
        "itinerary": {
            "destination": "Your Destination",
            "duration": "7 days",
            "highlights": ["Main attractions", "Local experiences", "Cultural sites"]
        }
    },
    
    "recommender_agent": {
        "recommendations": [
            {"name": "Top Attraction", "type": "cultural", "rating": 4.8},
            {"name": "Popular Restaurant", "type": "restaurant", "rating": 4.6},
            {"name": "Local Market", "type": "shopping", "rating": 4.5}
        ]
    },
    
    "activity_agent": {
        "activities": [
            {"name": "Cultural Tour", "duration": "3 hours", "cost": "$50"},
            {"name": "Food Experience", "duration": "2 hours", "cost": "$40"},
            {"name": "Adventure Activity", "duration": "4 hours", "cost": "$80"}
        ]
    }
}


def get_dummy_response(agent_name: str, input_payload: dict[str, Any] | None = None) -> dict[str, Any] | None:
    """
    Get context-aware dummy response for a given agent.
    
    Args:
        agent_name: Name of the agent
        input_payload: The input data sent to the agent (used for context)
        
    Returns:
        Dummy response dict based on context, or None if not found
    """
    input_payload = input_payload or {}
    
    # Context-aware agents
    if agent_name == "travel_planning_agent":
        return get_travel_planning_dummy(input_payload)
    
    if agent_name == "suggestion_agent":
        return get_suggestion_dummy(input_payload)
    
    if agent_name == "timeline_generation_agent":
        return get_timeline_dummy(input_payload)
    
    # Static responses for other agents
    return STATIC_RESPONSES.get(agent_name)


def has_dummy_response(agent_name: str) -> bool:
    """Check if dummy response exists for an agent."""
    dynamic_agents = {"travel_planning_agent", "suggestion_agent", "timeline_generation_agent"}
    return agent_name in dynamic_agents or agent_name in STATIC_RESPONSES
