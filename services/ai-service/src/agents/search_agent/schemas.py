"""Search Agent Schemas."""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class SearchInput(BaseModel):
    """Input schema for search agent."""
    category: str = Field(
        description="Element category: flight-booking, hotel-booking, restaurants, notes, general"
    )
    description: str = Field(
        description="Element description to search for"
    )
    context: Optional[dict] = Field(
        default=None,
        description="Additional context like dates, location, number of travelers"
    )


# Flight-specific schemas
class FlightResult(BaseModel):
    """A single flight search result."""
    id: str
    airline: str = Field(description="Airline name")
    airline_logo: Optional[str] = Field(default=None, description="URL to airline logo")
    flight_number: str
    departure_airport: str
    arrival_airport: str
    departure_time: str = Field(description="Departure time in ISO format")
    arrival_time: str = Field(description="Arrival time in ISO format")
    departure_date: str = Field(description="Departure date")
    duration: str = Field(description="Flight duration e.g., '2h 30m'")
    stops: int = Field(description="Number of stops, 0 for direct")
    stops_description: Optional[str] = Field(default=None, description="e.g., '1 stop via Dubai'")
    price: float
    currency: str = Field(default="USD")
    booking_url: Optional[str] = Field(default=None, description="URL to book the flight")
    cabin_class: str = Field(default="Economy")


class FlightSearchOutput(BaseModel):
    """Output schema for flight search."""
    category: Literal["flight-booking"] = "flight-booking"
    featured: FlightResult = Field(description="The recommended/best flight option")
    alternatives: List[FlightResult] = Field(default=[], description="Other flight options")


# Hotel-specific schemas
class HotelResult(BaseModel):
    """A single hotel search result."""
    id: str
    name: str
    image_url: Optional[str] = Field(default=None)
    location: str = Field(description="Hotel location/address")
    rating: float = Field(description="Star rating 1-5")
    review_score: Optional[float] = Field(default=None, description="Guest review score")
    review_count: Optional[int] = Field(default=None)
    price_per_night: float
    currency: str = Field(default="USD")
    amenities: List[str] = Field(default=[], description="Key amenities")
    booking_url: Optional[str] = Field(default=None)
    room_type: str = Field(default="Standard Room")


class HotelSearchOutput(BaseModel):
    """Output schema for hotel search."""
    category: Literal["hotel-booking"] = "hotel-booking"
    featured: HotelResult = Field(description="The recommended hotel")
    alternatives: List[HotelResult] = Field(default=[], description="Other hotel options")


# Restaurant-specific schemas
class RestaurantResult(BaseModel):
    """A single restaurant search result."""
    id: str
    name: str
    image_url: Optional[str] = Field(default=None)
    cuisine: str
    location: str
    rating: float
    price_level: str = Field(description="$, $$, $$$, or $$$$")
    review_count: Optional[int] = Field(default=None)
    booking_url: Optional[str] = Field(default=None)
    opening_hours: Optional[str] = Field(default=None)


class RestaurantSearchOutput(BaseModel):
    """Output schema for restaurant search."""
    category: Literal["restaurants"] = "restaurants"
    featured: RestaurantResult
    alternatives: List[RestaurantResult] = Field(default=[])


# General/Notes schemas
class GeneralResult(BaseModel):
    """A general search result for notes and general items."""
    id: str
    title: str
    description: str
    icon: Optional[str] = Field(default=None)
    action_url: Optional[str] = Field(default=None)
    action_label: Optional[str] = Field(default=None)


class GeneralSearchOutput(BaseModel):
    """Output schema for general/notes search."""
    category: Literal["notes", "general"]
    items: List[GeneralResult] = Field(default=[])


# Union output
class SearchOutput(BaseModel):
    """Combined search output that can be any category."""
    category: str
    data: dict = Field(description="Category-specific search results")
