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
    if "dubai" in latest_msg or "uae" in latest_msg:
        detected_values["destination"] = "Dubai, UAE"
    elif "tokyo" in latest_msg or "japan" in latest_msg:
        detected_values["destination"] = "Tokyo, Japan"
    elif "paris" in latest_msg or "france" in latest_msg:
        detected_values["destination"] = "Paris, France"
    elif "bali" in latest_msg or "indonesia" in latest_msg:
        detected_values["destination"] = "Bali, Indonesia"
    
    # Detect dates
    if "june" in latest_msg:
        detected_values["travel_dates"] = "June 2026"
    elif "march" in latest_msg:
        detected_values["travel_dates"] = "March 2026"
    elif "april" in latest_msg:
        detected_values["travel_dates"] = "April 2026"
    elif "next week" in latest_msg:
        detected_values["travel_dates"] = "Next week"
    elif "next month" in latest_msg:
        detected_values["travel_dates"] = "Next month"
    elif "this month" in latest_msg:
        detected_values["travel_dates"] = "This month"
    
    # Detect travelers
    if "family" in latest_msg or "kids" in latest_msg or "children" in latest_msg:
        detected_values["number_of_travelers"] = "4 (2 adults, 2 children)"
    elif "solo" in latest_msg or "just me" in latest_msg or "alone" in latest_msg:
        detected_values["number_of_travelers"] = "1 (solo traveler)"
    elif "couple" in latest_msg or "2 people" in latest_msg or "two of us" in latest_msg:
        detected_values["number_of_travelers"] = "2 (couple)"
    elif "friends" in latest_msg or "group" in latest_msg:
        detected_values["number_of_travelers"] = "4-6 (friends group)"
    
    # Detect budget (supports both INR and USD)
    if "budget" in latest_msg or "20k" in latest_msg or "20000" in latest_msg or "cheap" in latest_msg:
        detected_values["budget"] = "Budget (~₹20,000-30,000)"
    elif "mid" in latest_msg or "40k" in latest_msg or "60k" in latest_msg:
        detected_values["budget"] = "Mid-range (~₹40,000-60,000)"
    elif "comfort" in latest_msg or "80k" in latest_msg or "1l" in latest_msg or "1 lakh" in latest_msg:
        detected_values["budget"] = "Comfort (~₹80,000-1,00,000)"
    elif "luxury" in latest_msg or "1.5l" in latest_msg or "high end" in latest_msg:
        detected_values["budget"] = "Luxury (~₹1,50,000+)"
    
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
                {"id": "sug_1", "label": "Dubai, UAE", "value": "Dubai, UAE for shopping, beaches, and desert safari", "icon": {"provider": "iconify", "name": "mdi:city-variant"}, "type": "chip"},
                {"id": "sug_2", "label": "Tokyo, Japan", "value": "Tokyo, Japan for anime, tech, and culture", "icon": {"provider": "iconify", "name": "mdi:airplane"}, "type": "chip"},
                {"id": "sug_3", "label": "Bali, Indonesia", "value": "Bali, Indonesia for beaches and relaxation", "icon": {"provider": "iconify", "name": "mdi:beach"}, "type": "chip"},
                {"id": "sug_4", "label": "Paris, France", "value": "Paris, France for art, food, and romance", "icon": {"provider": "iconify", "name": "mdi:eiffel-tower"}, "type": "chip"},
            ]
        }
    
    # Date/timing suggestions
    if "when" in next_question or "date" in next_question or "time" in next_question:
        return {
            "suggestions": [
                {"id": "sug_1", "label": "This month", "value": "this month", "icon": {"provider": "iconify", "name": "mdi:calendar-today"}, "type": "chip"},
                {"id": "sug_2", "label": "Next month", "value": "next month", "icon": {"provider": "iconify", "name": "mdi:calendar-clock"}, "type": "chip"},
                {"id": "sug_3", "label": "June 2026", "value": "June 2026", "icon": {"provider": "iconify", "name": "mdi:calendar-month"}, "type": "chip"},
                {"id": "sug_4", "label": "Flexible", "value": "I'm flexible with dates", "icon": {"provider": "iconify", "name": "mdi:calendar-question"}, "type": "chip"},
            ]
        }
    
    # Traveler count suggestions
    if "how many" in next_question or "people" in next_question or "travelers" in next_question or "travelling" in next_question:
        return {
            "suggestions": [
                {"id": "sug_1", "label": "Solo", "value": "just me, solo travel", "icon": {"provider": "iconify", "name": "mdi:account"}, "type": "chip"},
                {"id": "sug_2", "label": "Couple", "value": "2 people, a couple", "icon": {"provider": "iconify", "name": "mdi:account-multiple"}, "type": "chip"},
                {"id": "sug_3", "label": "Family", "value": "family with 2 kids", "icon": {"provider": "iconify", "name": "mdi:account-group"}, "type": "chip"},
                {"id": "sug_4", "label": "Friends Group", "value": "group of 4-6 friends", "icon": {"provider": "iconify", "name": "mdi:account-multiple-outline"}, "type": "chip"},
            ]
        }
    
    # Budget suggestions (with INR for Indian travelers)
    if "budget" in next_question or "spend" in next_question or "cost" in next_question:
        return {
            "suggestions": [
                {"id": "sug_1", "label": "Budget (₹20k-30k)", "value": "budget-friendly, around ₹20,000-30,000", "icon": {"provider": "iconify", "name": "mdi:cash"}, "type": "chip"},
                {"id": "sug_2", "label": "Mid-range (₹40k-60k)", "value": "mid-range, around ₹40,000-60,000", "icon": {"provider": "iconify", "name": "mdi:cash-multiple"}, "type": "chip"},
                {"id": "sug_3", "label": "Comfort (₹80k-1L)", "value": "comfortable travel, around ₹80,000-1,00,000", "icon": {"provider": "iconify", "name": "mdi:wallet"}, "type": "chip"},
                {"id": "sug_4", "label": "Luxury (₹1.5L+)", "value": "luxury, over ₹1,50,000", "icon": {"provider": "iconify", "name": "mdi:star"}, "type": "chip"},
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
    elif "dubai" in dest.lower() or "uae" in dest.lower():
        # Dubai specific timeline - restructured flow
        timeline_data["configs"]["display_price_unit"] = "INR"
        timeline_data["nodes"].extend([
            # Node 1: Visa Booking (representation - clickable for details)
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 1,
                "type": "representation_node",
                "subtype": "info",
                "display_date": {
                    "type": "date_range",
                    "label": "T-30 to T-14 Days",
                    "start": "2026-05-01T00:00:00Z",
                    "end": "2026-05-17T23:59:00Z"
                },
                "representations": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "📋 Book Your Visa",
                        "description": "Apply for UAE Tourist Visa (14 or 30 days). Required: Passport scan, photo, hotel booking. Cost: ₹5,500-₹8,000",
                        "icon": "mdi:passport",
                        "markdown_content": """## 📋 UAE Tourist Visa Application

### Options to Apply
| Method | Cost (₹) | Processing |
|--------|----------|------------|
| Online (IVS, VFS) | ₹5,500–₹7,000 | 3–5 days |
| Via Emirates Airline | ₹4,500–₹6,000 | 2–4 days |
| Travel Agent | ₹6,000–₹8,000 | 3–5 days |

### Documents Required
- ✅ Passport (valid 6+ months, 2 blank pages)
- ✅ Passport-size photo (white background)
- ✅ Hotel booking confirmation
- ✅ Return flight ticket

> ⚠️ **Important**: Apply 2-3 weeks before travel!"""
                    }
                ]
            },
            # Node 2: Visa Processing Time (representation)
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 2,
                "type": "representation_node",
                "subtype": "warning",
                "display_date": {
                    "type": "date_range",
                    "label": "Processing Time",
                    "start": "2026-05-15T00:00:00Z",
                    "end": "2026-05-20T23:59:00Z"
                },
                "representations": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "⏳ Visa Processing: 3-5 Working Days",
                        "description": "Standard processing takes 3-5 working days. Express service available for urgent applications (extra ₹1,500-2,500).",
                        "icon": "mdi:clock-outline"
                    }
                ]
            },
            # Node 3: Book Flight & Hotel (task node with 2 sub-tasks)
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 3,
                "type": "task_node",
                "subtype": "booking",
                "display_date": {
                    "type": "date_range",
                    "label": "T-21 to T-7 Days",
                    "start": "2026-05-10T00:00:00Z",
                    "end": "2026-05-25T23:59:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "✈️ Book Your Flight",
                        "title_image": "mdi:airplane",
                        "description": "Book round-trip flight from Kerala to Dubai (DXB)",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 10000, "max": 25000}
                        },
                        "markdown_content": """## ✈️ Flight Booking

### Best Airlines (Kerala → Dubai)
| Airline | Type | Price (₹) |
|---------|------|-----------|
| Air India Express | Budget | ₹10,000–₹15,000 |
| IndiGo | Budget | ₹12,000–₹18,000 |
| Emirates | Premium | ₹20,000–₹35,000 |

### Tips
- 📅 Book 3-4 weeks in advance
- 🕐 Midweek flights are cheaper
- ⏰ Evening flights = less Kerala traffic"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "🏨 Book Your Hotel",
                        "title_image": "mdi:bed",
                        "description": "Book accommodation in Deira/Bur Dubai for budget + metro access",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 2500, "max": 7000}
                        },
                        "markdown_content": """## 🏨 Hotel Booking

### Recommended Areas (Budget + Metro)
| Area | Price/Night |
|------|-------------|
| Deira | ₹2,500–₹4,000 |
| Bur Dubai | ₹3,000–₹5,000 |
| Al Barsha | ₹3,500–₹6,000 |

> 💡 **Tip**: Book on Booking.com with free cancellation"""
                    }
                ],
                "recommendations": []
            },
            # Node 4: Items to Pack (task node)
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 4,
                "type": "task_node",
                "subtype": "preparation",
                "display_date": {
                    "type": "date_range",
                    "label": "T-7 to T-1 Days",
                    "start": "2026-05-25T00:00:00Z",
                    "end": "2026-05-31T23:59:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "🛒 Items to Buy Before Travel",
                        "title_image": "mdi:shopping",
                        "description": "Things to purchase in India before leaving",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 2000, "max": 5000}
                        },
                        "markdown_content": """## 🛒 Items to Buy in India

| Item | Est. Cost |
|------|-----------|
| Sunscreen SPF 50+ | ₹400–₹800 |
| ORS/Electrolyte sachets | ₹100–₹200 |
| Universal adapter (UK plugs) | ₹300–₹500 |
| Sunglasses | ₹500–₹2,000 |

> ⚠️ Dubai is 2-3x more expensive for basic items!"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "🎒 Items from Home (Checklist)",
                        "title_image": "mdi:bag-checked",
                        "description": "Essential documents and items to carry",
                        "price": None,
                        "markdown_content": """## 🎒 Packing Checklist

### 📄 Documents (CRITICAL)
| Document | Physical | Digital |
|----------|----------|---------|
| Passport | ✅ | ✅ Phone + Cloud |
| Visa (printed) | ✅ | ✅ |
| Flight tickets | Optional | ✅ |
| Hotel booking | Optional | ✅ |
| Bank cards | ✅ (2 cards) | - |

### 👕 Clothing (June Weather)
- Light cotton clothes
- 1 light hoodie (AC is freezing!)
- Comfortable walking shoes
- Swimwear

> 💡 Pack light - you'll want space for shopping!"""
                    }
                ],
                "recommendations": []
            },
            # Node 5: Traffic Warning - Day 0 (representation)
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 5,
                "type": "representation_node",
                "subtype": "warning",
                "display_date": {
                    "type": "date",
                    "label": "Day 0 - Departure",
                    "start": "2026-06-01T14:00:00Z"
                },
                "representations": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "🚗 High Traffic Alert to Airport",
                        "description": "Evening flight means peak traffic hours! Leave 4-5 hours before departure to avoid stress. Kerala roads can be unpredictable.",
                        "icon": "mdi:car-clock",
                        "markdown_content": """## 🚗 Traffic Warning - Kerala to Airport

### Recommendations
| Action | Time Before Flight |
|--------|-------------------|
| Leave home | 4-5 hours |
| Reach airport | 3 hours |

> ⚠️ Missing flights due to traffic is common. Don't risk it!"""
                    }
                ]
            },
            # Node 6: Airport Tasks (task node)
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 6,
                "type": "task_node",
                "subtype": "airport",
                "display_date": {
                    "type": "date",
                    "label": "Day 0 - At Airport",
                    "start": "2026-06-01T17:00:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "🛋️ Lounge Access",
                        "title_image": "mdi:sofa",
                        "description": "Use credit card lounge benefits (HDFC/ICICI/Axis)",
                        "price": None,
                        "markdown_content": """## 🛋️ Airport Lounge Access

### Free Access Cards
| Bank Card | Lounge |
|-----------|--------|
| HDFC Infinia/Diners | Priority Pass |
| ICICI Emeralde | Dreamfolks |
| Axis Atlas/Magnus | Lounge Key |
| SBI Elite | Dreamfolks |

> 💡 Eat and hydrate well at lounge - saves money in Dubai!"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "💱 Currency Exchange",
                        "title_image": "mdi:currency-usd",
                        "description": "Convert ₹5,000-₹8,000 to AED at airport",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 5000, "max": 10000}
                        }
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 3,
                        "title": "🛒 Duty Free Shopping (Optional)",
                        "title_image": "mdi:shopping-outline",
                        "description": "Perfumes, electronics, chocolates at tax-free prices",
                        "price": None
                    }
                ],
                "recommendations": []
            },
            # Node 7: Dubai Arrival - Weather (representation)
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 7,
                "type": "representation_node",
                "subtype": "warning",
                "display_date": {
                    "type": "date",
                    "label": "Day 0 - Dubai Arrival",
                    "start": "2026-06-01T23:30:00Z"
                },
                "representations": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "🌡️ Dubai Weather: 38-45°C (EXTREME HEAT)",
                        "description": "June is one of the hottest months! Expect 38-45°C during day. Metro and malls are heavily air-conditioned (carry hoodie). Drink water every 30-60 minutes.",
                        "icon": "mdi:weather-sunny-alert"
                    }
                ]
            },
            # Node 8: Dubai Airport Arrival Tasks
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 8,
                "type": "task_node",
                "subtype": "arrival",
                "display_date": {
                    "type": "date",
                    "label": "Day 0 - DXB Airport",
                    "start": "2026-06-02T00:00:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "🛂 Immigration & Arrival",
                        "title_image": "mdi:passport-biometric",
                        "description": "Clear immigration, collect luggage",
                        "price": None
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "📱 Buy SIM Card",
                        "title_image": "mdi:sim",
                        "description": "Get tourist SIM from DU/Etisalat counter",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 1100, "max": 2200}
                        }
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 3,
                        "title": "🚇 Buy NOL Card (Metro)",
                        "title_image": "mdi:subway-variant",
                        "description": "Get Silver NOL card for Metro/Bus/Tram",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 450, "max": 900}
                        }
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 4,
                        "title": "🏨 Transfer to Hotel",
                        "title_image": "mdi:taxi",
                        "description": "Metro or taxi to your hotel",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 200, "max": 900}
                        }
                    }
                ],
                "recommendations": []
            },
            # Day 1 - Old Dubai (Node 9)
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 9,
                "type": "task_node",
                "subtype": "default",
                "display_date": {
                    "type": "date",
                    "label": "Day 1",
                    "start": "2026-06-01T11:00:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "🏛️ Al Fahidi Historic District",
                        "title_image": "mdi:castle",
                        "description": "Walk museums, art galleries (cool morning)",
                        "price": None,
                        "markdown_content": """## 🏛️ Al Fahidi Historic Neighbourhood

### About
Historic **Al Bastakiya** district with traditional wind-tower architecture, art galleries, and museums.

### What to Do
- 🏛️ Walk through narrow lanes
- 🎨 Visit art galleries  
- 📸 Street photography
- ☕ Traditional Arabic coffee

### Getting There
- 30–60 min metro + short walk
- Metro: Al Fahidi Station

> ⚠️ **Heat Warning**: Finish outdoor walking by **11:30 AM**"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "⛵ Abra Ride + Souks",
                        "title_image": "mdi:ferry",
                        "description": "Cross Dubai Creek + Gold & Spice Souks",
                        "price": {
                            "type": "confirmed",
                            "unit": "INR",
                            "confirmed_price": 25
                        },
                        "markdown_content": """## ⛵ Abra Ride & Souks (Deira)

### Abra Ride
Traditional wooden boat across Dubai Creek
- **Cost**: ₹25 (AED 1) per crossing
- Experience: 5–10 minutes

### Gold & Spice Souks
| Souk | What to See |
|------|-------------|
| Gold Souk | Massive jewelry displays, window shopping |
| Spice Souk | Saffron, dates, dried fruits, spices |

### Tips
- 🛍️ Great for street photography
- 🍴 Food stalls nearby

> 💡 **Tip**: Bargaining is expected but be respectful"""
                    }
                ],
                "recommendations": [
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "restaurant",
                        "priority": 1,
                        "title": "🍛 Ravi Restaurant",
                        "title_image": "mdi:food",
                        "description": "Classic Pakistani/Indian curries & kebabs - legendary cheap eats!",
                        "price_included": True,
                        "price_info": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 340, "max": 900}
                        },
                        "markdown_content": """## 🍛 Ravi Restaurant (Satwa)

### Why Famous
**Legendary** cheap Pakistani/Indian restaurant since 1978. Every Dubai local knows Ravi!

### Must Try
- 🍗 Chicken Tikka
- 🍛 Biryani
- 🫓 Fresh Naan
- 🥘 Dal Makhani

### Details
| Info | Details |
|------|---------|
| Price | ₹340–₹900 per meal |
| Location | Satwa / Karama |
| Best For | Lunch & late-night dinner |

> ⭐ **Rating**: 4.4/5 on TripAdvisor (10,000+ reviews)"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "restaurant",
                        "priority": 2,
                        "title": "🥙 Al Mallah Shawarma",
                        "title_image": "mdi:food-drumstick",
                        "description": "Legendary shawarma & Lebanese street food",
                        "price_included": True,
                        "price_info": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 200, "max": 600}
                        }
                    }
                ]
            },
            # Day 1 - Evening
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 10,
                "type": "representation_node",
                "subtype": "tip",
                "display_date": {
                    "type": "date",
                    "label": "Day 1 Evening",
                    "start": "2026-06-01T19:00:00Z"
                },
                "representations": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "🌙 Al Seef Evening Stroll",
                        "description": "Nice evening vibe by the creek",
                        "icon": "mdi:walk",
                        "markdown_content": """## 🌙 Day 1 Evening Plan

### 19:00 - Dinner at Al Mallah
- Location: Satwa
- Famous for: Shawarma, grills, manakeesh
- **Budget**: ₹200–₹600

### 21:00 - Al Seef Walk
Beautiful waterfront promenade with:
- Traditional architecture
- Cafés and restaurants
- Creek views

### 💰 Day 1 Budget Summary
| Item | Cost (₹) |
|------|----------|
| Meals | ₹340–₹1,400 |
| Transport | ₹450–₹1,350 |
| Abra | ₹25 |
| **Total** | **₹800–₹2,800** |

> 💧 **Hydration Reminder**: 1 bottle every 60–90 minutes"""
                    }
                ]
            },
            # Day 2 - Downtown Dubai
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 11,
                "type": "task_node",
                "subtype": "default",
                "display_date": {
                    "type": "date",
                    "label": "Day 2",
                    "start": "2026-06-02T09:00:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "🏙️ Burj Khalifa - At The Top",
                        "title_image": "mdi:office-building",
                        "description": "World's tallest building - prebook morning slot!",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 3200, "max": 5400}
                        },
                        "markdown_content": """## 🏙️ Burj Khalifa - At The Top

### Book in Advance!
Prebook **morning slot** (9-10 AM) to avoid crowds.

### Ticket Options
| Level | Price (₹) |
|-------|-----------|
| Level 124 & 125 | ₹3,200–₹3,600 |
| Level 148 (Premium) | ₹5,000–₹5,400 |

### Tips
- ⏰ Morning = cooler + better visibility
- 📸 Best photos from outdoor platform
- ⏱️ Visit duration: 1-2 hours

> 💡 **Tip**: Book on official website for best prices"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "🛍️ Dubai Mall Exploration",
                        "title_image": "mdi:shopping",
                        "description": "World's largest mall - aquarium, food court, shops",
                        "price": None,
                        "markdown_content": """## 🛍️ Dubai Mall

### Why Visit
- 🐠 Dubai Aquarium (₹2,700 optional)
- 🛍️ 1,200+ shops
- 🍔 Massive food court
- ❄️ Ice rink

### Food Court Budget
| Option | Cost |
|--------|------|
| Shawarma/Kebab | ₹200–₹450 |
| Fast Food | ₹350–₹550 |
| Casual Dining | ₹700–₹1,200 |

### Metro Access
- Station: Burj Khalifa/Dubai Mall
- Connected walkway to mall

> ❄️ **Note**: Mall is freezing cold - keep hoodie handy"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 3,
                        "title": "⛲ Dubai Fountain Show",
                        "title_image": "mdi:fountain",
                        "description": "Free evening shows - world's largest choreographed fountain",
                        "price": None,
                        "markdown_content": """## ⛲ Dubai Fountain Show

### Show Timing
- Evening shows: **6:00 PM onwards**
- Every **30 minutes** until 11 PM
- **FREE** to watch!

### Best Viewing Spots
1. Dubai Mall waterfront promenade
2. Souk Al Bahar bridge
3. Boat ride on Burj Lake (₹1,500)

### What to Expect
- 🎵 Music synchronized water show
- 💡 Light effects
- ⏱️ Each show: 5 minutes

> 🌅 **Best Time**: Sunset show (6:00 PM) for magical lighting"""
                    }
                ],
                "recommendations": [
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "restaurant",
                        "priority": 1,
                        "title": "🍽️ Lebanese Kitchen",
                        "title_image": "mdi:food-halal",
                        "description": "Authentic Middle Eastern near Downtown",
                        "price_included": True,
                        "price_info": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 600, "max": 1400}
                        }
                    }
                ]
            },
            # Day 3 - Beach & Marina
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 12,
                "type": "task_node",
                "subtype": "default",
                "display_date": {
                    "type": "date",
                    "label": "Day 3",
                    "start": "2026-06-03T08:30:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "🏖️ JBR Beach Morning",
                        "title_image": "mdi:beach",
                        "description": "Morning beach stroll when it's cooler",
                        "price": None,
                        "markdown_content": """## 🏖️ JBR Beach (Jumeirah Beach Residence)

### Morning Beach Time (7:30–10:30 AM)
- 🏖️ Public beach - free entry
- 🏃 Morning jog/walk on promenade
- 📸 Great photos with Ain Dubai

### Beach Rules
- ✅ Swimwear allowed at beach
- ❌ No glass bottles
- ❌ No loud music

> ⚠️ **Warning**: Leave beach by **10:30 AM** - sun becomes brutal!

### Getting There
- Metro: DMCC + Tram to JBR
- Taxi: ₹450–₹900 from Deira"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "🦐 Bu Qtair Seafood",
                        "title_image": "mdi:fish",
                        "description": "Fresh grilled seafood - legendary local spot!",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 700, "max": 1400}
                        },
                        "markdown_content": """## 🦐 Bu Qtair Fish Restaurant

### Why It's Special
**Simple, fresh, legendary** - this is THE seafood spot locals love!

### How It Works
1. Pick your fresh fish
2. Choose: fried or grilled
3. Served with rice & salad
4. Eat at plastic tables by the sea

### Menu
| Item | Price (₹) |
|------|-----------|
| Grilled Fish | ₹450–₹900 |
| Prawns | ₹700–₹1,100 |
| Full Meal | ₹700–₹1,400 |

### Tips
- 🕐 Arrive by 11:30 AM (queue forms fast)
- 🪑 Outdoor seating only
- 💵 Cash preferred

> ⭐ **TripAdvisor**: 4.5/5 - "Best fish in Dubai"
> 📍 Location: Jumeirah Fishing Harbour"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 3,
                        "title": "🚶 Dubai Marina Walk",
                        "title_image": "mdi:walk",
                        "description": "Walk the promenade, cafés, optional boat cruise",
                        "price": None,
                        "markdown_content": """## 🚶 Dubai Marina Walk

### Afternoon (4:00–8:00 PM)
Beautiful waterfront with:
- 🏙️ Stunning skyline views
- ☕ Cafés and restaurants
- 🛍️ Marina Mall

### Optional Activities
| Activity | Price (₹) |
|----------|-----------|
| Dhow Cruise | ₹1,500–₹2,700 |
| Ain Dubai | ₹2,700–₹4,000 |
| Yacht Rental | ₹9,000+ (group) |

### Getting Around
- 🚃 Dubai Tram runs along Marina
- Free to walk the promenade

> 🌅 **Best Time**: Golden hour for photos (5:30–6:30 PM)"""
                    }
                ],
                "recommendations": []
            },
            # Day 4 - Desert Safari
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 13,
                "type": "representation_node",
                "subtype": "warning",
                "display_date": {
                    "type": "date",
                    "label": "Day 4 Morning",
                    "start": "2026-06-04T08:00:00Z"
                },
                "representations": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "😴 Sleep In / Relax Morning",
                        "description": "Light morning before desert adventure",
                        "icon": "mdi:sleep",
                        "markdown_content": """## 😴 Day 4 Morning - Relax

### Plan
- Sleep in (recover from previous days)
- Light breakfast
- Pool time if hotel has one
- Small shopping / mall time

### Desert Safari Prep
- 🥗 **Eat light lunch** (heavy food + dune bashing = bad combo)
- 💧 Hydrate well
- 👕 Wear comfortable clothes
- 📱 Charge phone & camera

> ⚠️ **Health Tip**: Avoid heavy lunch before safari - motion sickness risk!"""
                    }
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 14,
                "type": "task_node",
                "subtype": "activity",
                "display_date": {
                    "type": "date",
                    "label": "Day 4 Evening",
                    "start": "2026-06-04T15:00:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "🏜️ Desert Safari + BBQ Dinner",
                        "title_image": "mdi:terrain",
                        "description": "6-hour experience: dune bashing, camel ride, BBQ",
                        "price": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 2700, "max": 5600}
                        },
                        "markdown_content": """## 🏜️ Desert Safari Experience

### What's Included
| Activity | Details |
|----------|---------|
| 🚙 Dune Bashing | Thrilling 4x4 ride over sand dunes |
| 🐪 Camel Ride | Short desert ride |
| 🏕️ Desert Camp | Traditional Bedouin camp |
| 🍖 BBQ Dinner | Large spread with non-veg options |
| 💃 Entertainment | Belly dance, tanoura, fire show |
| 🌅 Sunset | Desert sunset photos |

### Pricing
| Type | Price (₹) |
|------|-----------|
| Shared Jeep | ₹2,700–₹3,600 |
| Private Vehicle | ₹4,500–₹5,600 |

### Schedule
- **15:00**: Hotel pickup
- **16:00**: Dune bashing
- **17:30**: Sunset, camel ride
- **19:00**: BBQ dinner + shows
- **21:00**: Return to hotel

### Tips
- 📷 Great photo opportunities
- 🏜️ June safaris may be shorter due to heat
- ⭐ Book reputable operator with good reviews

> 💡 **Book**: Viator, GetYourGuide, or hotel concierge"""
                    }
                ],
                "recommendations": []
            },
            # Day 5 - Departure
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 15,
                "type": "task_node",
                "subtype": "departure",
                "display_date": {
                    "type": "date",
                    "label": "Day 5",
                    "start": "2026-06-05T08:30:00Z"
                },
                "tasks": [
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 1,
                        "title": "📦 Check Out & Pack",
                        "title_image": "mdi:bag-suitcase",
                        "description": "Pack bags, check out (leave luggage if late flight)",
                        "price": None
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 2,
                        "title": "🌴 Palm Jumeirah Visit",
                        "title_image": "mdi:palm-tree",
                        "description": "Quick visit to The Pointe, Atlantis photo",
                        "price": None,
                        "markdown_content": """## 🌴 Palm Jumeirah - Quick Visit

### The Pointe
- 📸 Photo stop with Atlantis view
- ☕ Quick coffee/breakfast
- 🛍️ Small shopping area

### Getting There
- Monorail from Gateway Station
- Or taxi/Uber

### Alternative: Mall of Emirates
- View ski slope from outside (free)
- Quick shopping
- Air-conditioned comfort

> ⏰ **Time available**: Depends on your flight time"""
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "execution_state": "pending",
                        "visit_status": "no_action",
                        "priority": 3,
                        "title": "✈️ Airport & Departure",
                        "title_image": "mdi:airplane-takeoff",
                        "description": "Reach DXB 3 hours early, duty free shopping",
                        "price": None,
                        "markdown_content": """## ✈️ Departure Checklist

### Before Leaving Hotel
- ✅ Check all drawers & bathroom
- ✅ Collect passport from safe
- ✅ Keep boarding pass ready

### At Airport
- 🕐 Reach **3 hours early**
- 💵 Spend leftover AED at duty free
- 🛃 Immigration is usually quick

### Duty Free Tips
- 🍫 Chocolates & dates (great gifts)
- 🥃 Alcohol (if applicable)
- 📱 Electronics deals

> 💡 **Tip**: DXB Terminal 3 has excellent duty free"""
                    }
                ],
                "recommendations": [
                    {
                        "id": str(uuid.uuid4()),
                        "action_state": "suggested",
                        "type": "restaurant",
                        "priority": 1,
                        "title": "🥙 Final Shawarma Stop",
                        "title_image": "mdi:food",
                        "description": "One last authentic shawarma before flight!",
                        "price_included": True,
                        "price_info": {
                            "type": "range",
                            "unit": "INR",
                            "range": {"min": 200, "max": 450}
                        }
                    }
                ]
            },
            # Global Warnings Node
            {
                "id": str(uuid.uuid4()),
                "node_version": 1,
                "order": 16,
                "type": "representation_node",
                "subtype": "warning",
                "display_date": None,
                "representations": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "⚠️ Important Warnings (Every Day)",
                        "description": "Critical reminders for your Dubai trip",
                        "icon": "mdi:alert",
                        "markdown_content": """## ⚠️ Global Warnings (Apply Every Day)

### 🌡️ Weather (June = EXTREME HEAT)
| Time | Temperature |
|------|-------------|
| Day | 38–45°C (feels like 50°C) |
| Night | 28–33°C |

### ❗ Daily Warnings
- 🚱 **Dehydration** is the #1 problem
- ❄️ Metro & malls are **very cold** (carry hoodie)
- 🚶 Don't walk unnecessarily in daytime
- 💧 Drink 1 bottle every 60–90 min

### 🕌 Cultural & Legal
- ❌ No public drinking of alcohol
- ❌ No vaping in restricted areas
- ❌ No photography of locals without permission
- 💑 Minimal PDA (public affection)

### 💰 Budget Summary (Full Trip)
| Category | Budget (₹) |
|----------|------------|
| Flights (Kerala↔Dubai) | ₹10,000–₹30,000 |
| Accommodation (4 nights) | ₹11,000–₹28,000 |
| Food (5 days) | ₹4,500–₹10,000 |
| Activities & Transport | ₹6,000–₹18,000 |
| **Total (ex-flight)** | **₹20,000–₹50,000** |

> 💡 **Tip**: Book early to lower costs!"""
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
