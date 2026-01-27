"""Agent execution engine using Google ADK."""

import json
import logging
from typing import Any

from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from .base import BaseAgent
from .errors import (
    AgentNotFoundError,
    InvalidOutputError,
    create_error_response,
)
from .registry import AgentRegistry
from .schemas import AgentResponse

logger = logging.getLogger(__name__)


async def execute_agent(
    agent_name: str,
    input_payload: dict[str, Any],
) -> AgentResponse:
    """
    Execute an agent with the given input payload.
    
    This is the single entrypoint for all agent executions.
    
    Args:
        agent_name: Name of the agent to execute
        input_payload: Input data for the agent
        
    Returns:
        AgentResponse with either success output or error details
    """
    logger.info(f"Executing agent '{agent_name}' with input: {input_payload}")
    
    try:
        # 1. Get agent from registry
        agent = AgentRegistry.get(agent_name)
        if agent is None:
            raise AgentNotFoundError(agent_name)
        logger.debug(f"Found agent: {agent.name}, description: {agent.description}")

        # 2. Format input for the agent
        formatted_input = agent.format_input(input_payload)

        # 3. Get the ADK agent instance
        adk_agent = agent.get_adk_agent()

        # 4. Create runner
        runner = InMemoryRunner(
            agent=adk_agent,
            app_name=agent_name,
        )

        # 5. Create a session with initial state from input_payload
        logger.debug(f"Creating session with state: {input_payload}")
        session = await runner.session_service.create_session(
            app_name=agent_name,
            user_id="system",
            state=input_payload,
        )
        logger.debug(f"Session created - ID: {session.id}, state: {session.state}")

        # 6. Create the user message
        user_content = types.Content(
            role="user",
            parts=[types.Part.from_text(text=formatted_input)],
        )

        # 7. Execute the agent and collect response
        final_response_text = ""
        async for event in runner.run_async(
            user_id="system",
            session_id=session.id,
            new_message=user_content,
        ):
            # Collect text parts from model responses
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if hasattr(part, "text") and part.text:
                        final_response_text += part.text

        # 8. Parse and validate JSON output
        if not final_response_text.strip():
            raise InvalidOutputError(agent_name, "Empty response from agent")

        try:
            output_data = json.loads(final_response_text)
        except json.JSONDecodeError as e:
            raise InvalidOutputError(agent_name, str(e))

        # 9. Validate against output schema
        output_schema = agent.output_schema
        try:
            validated_output = output_schema.model_validate(output_data)
            output_dict = validated_output.model_dump()
        except Exception as e:
            raise InvalidOutputError(agent_name, f"Schema validation failed: {e}")

        # 10. Return success response
        return AgentResponse(
            status="success",
            agent_name=agent_name,
            output=output_dict,
        )

    except Exception as e:
        logger.exception(f"Error executing agent '{agent_name}': {e}")
        return create_error_response(agent_name, e)
