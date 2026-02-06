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
    Returns data matching the WebSocket TimelineData format.
    """
    import uuid
    
    plan_summary = input_payload.get("plan_summary", {})
    user_vars = plan_summary.get("user_variables", [])
    
    # Extract destination for customization
    dest = "Your Destination"
    travel_dates = "upcoming"
    for v in user_vars:
        if v.get("field_name") == "destination":
            dest = v.get("value", "Your Destination")
        elif v.get("field_name") == "travel_dates":
            travel_dates = v.get("value", "upcoming")
    
    # Generate base timeline structure matching WebSocket types
    timeline_data = {
        "style": "default",
        "configs": {
            "display_price_unit": "USD",
            "timezone": "UTC"
        },
        "nodes": []
    }
    
    # Start node
    timeline_data["nodes"].append({
        "id": str(uuid.uuid4()),
        "node_version": 1,
        "order": 0,
        "type": "start",
        "subtype": None,
        "display_date": None
    })
    
    # Generate nodes based on destination
    if "tokyo" in dest.lower() or "japan" in dest.lower():
        # Tokyo specific timeline
        timeline_data["nodes"].extend([
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 1,
                "type": "task_node",
                "subtype": "default",
                "display_date": {
                    "type": "date_range",
                    "label": "Day 1-2",
                    "start": "2026-03-01T00:00:00Z",
                    "end": "2026-03-02T23:59:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "Book flight to Tokyo",
                        "title_image": "mdi:airplane-takeoff",
                        "description": "Direct flights available from major cities",
                        "price": {
                            "type": "range",
                            "unit": "USD",
                            "range": {"min": 800, "max": 1200}
                        }
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "Book hotel in Shinjuku",
                        "title_image": "mdi:bed",
                        "description": "Central location, great for exploring",
                        "price": {
                            "type": "range",
                            "unit": "USD",
                            "range": {"min": 150, "max": 300}
                        }
                    }
                ],
                "recommendations": [
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "place",
                        "priority": 1,
                        "title": "Visit Shinjuku Gyoen Garden",
                        "title_image": "mdi:flower",
                        "description": "Beautiful gardens, perfect for jet lag recovery",
                        "price_included": True,
                        "price_info": {
                            "type": "confirmed",
                            "unit": "JPY",
                            "confirmed_price": 500
                        }
                    }
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 2,
                "type": "representation_node",
                "subtype": None,
                "display_date": {
                    "type": "date",
                    "label": "Day 3",
                    "start": "2026-03-03T00:00:00Z"
                },
                "representations": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "Weather Advisory",
                        "description": "March in Tokyo can be chilly. Pack layers and a light jacket.",
                        "icon": "mdi:weather-partly-cloudy"
                    }
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 3,
                "type": "task_node",
                "subtype": "default",
                "display_date": {
                    "type": "date",
                    "label": "Day 3",
                    "start": "2026-03-03T09:00:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "Explore Akihabara",
                        "title_image": "mdi:gamepad-variant",
                        "description": "Electronics and anime paradise",
                        "price": None
                    }
                ],
                "recommendations": [
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "restaurant",
                        "priority": 1,
                        "title": "Try Ramen at Ichiran",
                        "title_image": "mdi:noodles",
                        "description": "Famous tonkotsu ramen chain",
                        "price_included": True,
                        "price_info": {
                            "type": "range",
                            "unit": "JPY",
                            "range": {"min": 900, "max": 1500}
                        }
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "place",
                        "priority": 2,
                        "title": "Visit teamLab Borderless",
                        "title_image": "mdi:palette",
                        "description": "Immersive digital art museum",
                        "price_included": True,
                        "price_info": {
                            "type": "confirmed",
                            "unit": "JPY",
                            "confirmed_price": 3200
                        }
                    }
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 4,
                "type": "task_node",
                "subtype": "default",
                "display_date": {
                    "type": "date",
                    "label": "Day 4",
                    "start": "2026-03-04T09:00:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "Visit Senso-ji Temple",
                        "title_image": "mdi:temple-buddhist",
                        "description": "Tokyo's oldest temple in Asakusa",
                        "price": None
                    }
                ],
                "recommendations": [
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "activity",
                        "priority": 1,
                        "title": "Try traditional Kimono rental",
                        "title_image": "mdi:tshirt-crew",
                        "description": "Walk around Asakusa in traditional attire",
                        "price_included": True,
                        "price_info": {
                            "type": "range",
                            "unit": "JPY",
                            "range": {"min": 3000, "max": 5000}
                        }
                    }
                ]
            }
        ])
    else:
        # Default generic timeline
        timeline_data["nodes"].extend([
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 1,
                "type": "task_node",
                "subtype": "default",
                "display_date": {
                    "type": "date_range",
                    "label": "Day 1-2",
                    "start": "2026-03-01T00:00:00Z",
                    "end": "2026-03-02T23:59:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": f"Book flight to {dest}",
                        "title_image": "mdi:airplane-takeoff",
                        "description": "Search for best deals on flights",
                        "price": {
                            "type": "range",
                            "unit": "USD",
                            "range": {"min": 500, "max": 1000}
                        }
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "Book accommodation",
                        "title_image": "mdi:bed",
                        "description": "Find a hotel or vacation rental",
                        "price": {
                            "type": "range",
                            "unit": "USD",
                            "range": {"min": 100, "max": 250}
                        }
                    }
                ],
                "recommendations": [
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "place",
                        "priority": 1,
                        "title": "Explore the city center",
                        "title_image": "mdi:walk",
                        "description": "Get oriented with your surroundings",
                        "price_included": False
                    }
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 2,
                "type": "representation_node",
                "subtype": None,
                "display_date": {
                    "type": "date",
                    "label": "Day 2",
                    "start": "2026-03-02T00:00:00Z"
                },
                "representations": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "Travel Tip",
                        "description": "Consider getting a local SIM card or portable WiFi for navigation and communication.",
                        "icon": "mdi:lightbulb"
                    }
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 3,
                "type": "task_node",
                "subtype": "default",
                "display_date": {
                    "type": "date",
                    "label": "Day 3",
                    "start": "2026-03-03T09:00:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "Visit main attractions",
                        "title_image": "mdi:camera",
                        "description": "See the most famous sights",
                        "price": None
                    }
                ],
                "recommendations": [
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "restaurant",
                        "priority": 1,
                        "title": "Try local cuisine",
                        "title_image": "mdi:food",
                        "description": "Sample authentic local dishes",
                        "price_included": True,
                        "price_info": {
                            "type": "range",
                            "unit": "USD",
                            "range": {"min": 20, "max": 50}
                        }
                    }
                ]
            }
        ])
    
    # End node
    timeline_data["nodes"].append({
        "id": str(uuid.uuid4()),
        "node_version": 1,
        "order": 99,
        "type": "end",
        "subtype": None,
        "display_date": None
    })
    
    return timeline_data


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
