"""Tests for the FastAPI application."""

import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.framework.registry import AgentRegistry


@pytest.fixture
def client():
    """Create test client."""
    with TestClient(app) as c:
        yield c


class TestHealthEndpoint:
    """Tests for the /health endpoint."""

    def test_health_returns_healthy(self, client):
        """Test health check returns healthy status."""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestAgentsEndpoint:
    """Tests for the /agents endpoint."""

    def test_list_agents_returns_list(self, client):
        """Test agents endpoint returns a list."""
        response = client.get("/agents")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_list_agents_contains_registered_agents(self, client):
        """Test agents list contains registered agents."""
        response = client.get("/agents")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have our 3 registered agents
        names = [agent["name"] for agent in data]
        assert "itinerary_generator" in names
        assert "destination_recommender" in names
        assert "activity_suggester" in names


class TestExecuteEndpoint:
    """Tests for the /execute endpoint."""

    def test_execute_requires_agent_name(self, client):
        """Test execute requires agent_name field."""
        response = client.post(
            "/execute",
            json={"input_payload": {}},
        )
        
        assert response.status_code == 422  # Validation error

    def test_execute_unknown_agent(self, client):
        """Test execute with unknown agent returns cannot_proceed."""
        response = client.post(
            "/execute",
            json={
                "agent_name": "unknown_agent",
                "input_payload": {},
            },
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cannot_proceed"
        assert data["agent_name"] == "unknown_agent"
        assert "not found" in data["reason"].lower()

    def test_execute_valid_request_structure(self, client):
        """Test execute accepts valid request structure."""
        response = client.post(
            "/execute",
            json={
                "agent_name": "itinerary_generator",
                "input_payload": {
                    "destination": "Paris",
                    "duration_days": 3,
                },
            },
        )
        
        # Should return 200 (even if agent execution fails due to no API key)
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "agent_name" in data
