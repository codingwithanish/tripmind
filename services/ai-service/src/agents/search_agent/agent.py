"""Search Agent implementation with dummy data."""

import uuid
from google.adk.agents import Agent
from google.adk.agents.readonly_context import ReadonlyContext
from pydantic import BaseModel

from src.framework.base import BaseAgent
from .schemas import SearchOutput


def get_dummy_flight_results() -> dict:
    """Return dummy flight search results."""
    return {
        "category": "flight-booking",
        "featured": {
            "id": str(uuid.uuid4()),
            "airline": "Emirates",
            "airline_logo": "https://logos-world.net/wp-content/uploads/2020/03/Emirates-Logo.png",
            "flight_number": "EK505",
            "departure_airport": "JFK",
            "arrival_airport": "DXB",
            "departure_time": "2026-03-15T22:00:00",
            "arrival_time": "2026-03-16T19:30:00",
            "departure_date": "March 15, 2026",
            "duration": "13h 30m",
            "stops": 0,
            "stops_description": "Direct",
            "price": 1249.00,
            "currency": "USD",
            "booking_url": "https://www.emirates.com",
            "cabin_class": "Economy"
        },
        "alternatives": [
            {
                "id": str(uuid.uuid4()),
                "airline": "Qatar Airways",
                "airline_logo": "https://logos-world.net/wp-content/uploads/2020/03/Qatar-Airways-Logo.png",
                "flight_number": "QR702",
                "departure_airport": "JFK",
                "arrival_airport": "DOH",
                "departure_time": "2026-03-15T20:15:00",
                "arrival_time": "2026-03-16T16:45:00",
                "departure_date": "March 15, 2026",
                "duration": "12h 30m",
                "stops": 0,
                "stops_description": "Direct",
                "price": 1189.00,
                "currency": "USD",
                "booking_url": "https://www.qatarairways.com",
                "cabin_class": "Economy"
            },
            {
                "id": str(uuid.uuid4()),
                "airline": "Turkish Airlines",
                "airline_logo": "https://logos-world.net/wp-content/uploads/2020/11/Turkish-Airlines-Logo.png",
                "flight_number": "TK12",
                "departure_airport": "JFK",
                "arrival_airport": "IST",
                "departure_time": "2026-03-15T23:30:00",
                "arrival_time": "2026-03-16T17:00:00",
                "departure_date": "March 15, 2026",
                "duration": "10h 30m",
                "stops": 1,
                "stops_description": "1 stop via Istanbul",
                "price": 899.00,
                "currency": "USD",
                "booking_url": "https://www.turkishairlines.com",
                "cabin_class": "Economy"
            },
            {
                "id": str(uuid.uuid4()),
                "airline": "Lufthansa",
                "airline_logo": "https://logos-world.net/wp-content/uploads/2020/10/Lufthansa-Logo.png",
                "flight_number": "LH401",
                "departure_airport": "JFK",
                "arrival_airport": "FRA",
                "departure_time": "2026-03-15T18:00:00",
                "arrival_time": "2026-03-16T07:30:00",
                "departure_date": "March 15, 2026",
                "duration": "7h 30m",
                "stops": 0,
                "stops_description": "Direct",
                "price": 1099.00,
                "currency": "USD",
                "booking_url": "https://www.lufthansa.com",
                "cabin_class": "Economy"
            }
        ]
    }


def get_dummy_hotel_results() -> dict:
    """Return dummy hotel search results."""
    return {
        "category": "hotel-booking",
        "featured": {
            "id": str(uuid.uuid4()),
            "name": "The Ritz-Carlton Tokyo",
            "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "location": "Tokyo Midtown, Roppongi, Tokyo",
            "rating": 5.0,
            "review_score": 9.4,
            "review_count": 2847,
            "price_per_night": 450.00,
            "currency": "USD",
            "amenities": ["Free WiFi", "Spa", "Fitness Center", "Restaurant", "Pool"],
            "booking_url": "https://www.ritzcarlton.com/tokyo",
            "room_type": "Deluxe Room"
        },
        "alternatives": [
            {
                "id": str(uuid.uuid4()),
                "name": "Park Hyatt Tokyo",
                "image_url": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
                "location": "Shinjuku, Tokyo",
                "rating": 5.0,
                "review_score": 9.2,
                "review_count": 1923,
                "price_per_night": 520.00,
                "currency": "USD",
                "amenities": ["Free WiFi", "Spa", "Pool", "Restaurant"],
                "booking_url": "https://www.hyatt.com/parkhyatt/tokyo",
                "room_type": "Park Room"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Aman Tokyo",
                "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                "location": "Otemachi, Tokyo",
                "rating": 5.0,
                "review_score": 9.6,
                "review_count": 876,
                "price_per_night": 890.00,
                "currency": "USD",
                "amenities": ["Spa", "Pool", "Fine Dining", "Japanese Garden"],
                "booking_url": "https://www.aman.com/tokyo",
                "room_type": "Deluxe Room"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Hotel Gracery Shinjuku",
                "image_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                "location": "Kabukicho, Shinjuku, Tokyo",
                "rating": 4.0,
                "review_score": 8.5,
                "review_count": 5234,
                "price_per_night": 120.00,
                "currency": "USD",
                "amenities": ["Free WiFi", "Restaurant", "Godzilla Statue"],
                "booking_url": "https://gracery.com/shinjuku",
                "room_type": "Standard Room"
            }
        ]
    }


def get_dummy_restaurant_results() -> dict:
    """Return dummy restaurant search results."""
    return {
        "category": "restaurants",
        "featured": {
            "id": str(uuid.uuid4()),
            "name": "Sukiyabashi Jiro",
            "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
            "cuisine": "Japanese Sushi",
            "location": "Ginza, Tokyo",
            "rating": 4.9,
            "price_level": "$$$$",
            "review_count": 1247,
            "booking_url": "https://jiro.jp/reservation",
            "opening_hours": "11:30 AM - 2:00 PM, 5:30 PM - 8:30 PM"
        },
        "alternatives": [
            {
                "id": str(uuid.uuid4()),
                "name": "Narisawa",
                "image_url": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
                "cuisine": "Innovative Japanese",
                "location": "Minato, Tokyo",
                "rating": 4.8,
                "price_level": "$$$$",
                "review_count": 892,
                "booking_url": "https://narisawa.co.jp",
                "opening_hours": "12:00 PM - 1:30 PM, 6:00 PM - 9:00 PM"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Ichiran Ramen",
                "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
                "cuisine": "Ramen",
                "location": "Shibuya, Tokyo",
                "rating": 4.5,
                "price_level": "$",
                "review_count": 8234,
                "booking_url": None,
                "opening_hours": "24 hours"
            }
        ]
    }


def get_dummy_general_results(category: str) -> dict:
    """Return dummy general/notes search results."""
    return {
        "category": category,
        "items": [
            {
                "id": str(uuid.uuid4()),
                "title": "Important Travel Tips",
                "description": "Remember to bring your passport, check visa requirements, and download offline maps.",
                "icon": "mdi:information",
                "action_url": None,
                "action_label": None
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Local Currency",
                "description": "The local currency is Japanese Yen (JPY). Credit cards are widely accepted in major cities.",
                "icon": "mdi:currency-jpy",
                "action_url": None,
                "action_label": None
            }
        ]
    }


def instruction_provider(ctx: ReadonlyContext) -> str:
    """Instruction provider for search agent."""
    category = ctx.state.get("category", "general")
    description = ctx.state.get("description", "")
    context = ctx.state.get("context", {})
    
    return f"""You are a travel search assistant. Search for relevant options based on:
    
Category: {category}
Description: {description}
Context: {context}

Return search results matching the SearchOutput schema.
"""


class SearchAgent(BaseAgent):
    """
    Agent that searches for travel-related items based on category.
    
    For now, returns dummy data based on category type.
    """

    @property
    def name(self) -> str:
        return "search_agent"

    @property
    def description(self) -> str:
        return "Searches for flights, hotels, restaurants, and general travel information"

    @property
    def output_schema(self) -> type[BaseModel]:
        return SearchOutput

    def get_adk_agent(self) -> Agent:
        return Agent(
            name=self.name,
            model="gemini-2.0-flash",
            description=self.description,
            instruction=instruction_provider,
            output_schema=SearchOutput,
        )

    def execute_with_dummy_data(self, category: str, description: str, context: dict = None) -> dict:
        """Execute search with dummy data based on category."""
        category_lower = category.lower().replace("-", "_").replace(" ", "_")
        
        if category_lower in ["flight_booking", "flight", "flights"]:
            return get_dummy_flight_results()
        elif category_lower in ["hotel_booking", "hotel", "hotels", "accommodation"]:
            return get_dummy_hotel_results()
        elif category_lower in ["restaurants", "restaurant", "dining", "food"]:
            return get_dummy_restaurant_results()
        else:
            return get_dummy_general_results(category)
