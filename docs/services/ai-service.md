# AI Service

Python-based AI service for intelligent travel planning.

## Overview

The AI Service handles all AI/ML-powered features:
- Natural language understanding for travel queries
- Itinerary generation and optimization
- Personalized recommendations
- Conversational AI interactions

## Location

`services/ai-service/`

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI (planned)
- **AI**: LangGraph, LangChain
- **LLM**: OpenAI / Anthropic

## Status

🚧 **Planned** - Not yet implemented

## Planned Features

- [ ] Travel query understanding
- [ ] Itinerary generation
- [ ] Activity recommendations
- [ ] Budget optimization
- [ ] Conversational planning

## Development

```bash
cd services/ai-service
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
travel planning ai-agent implementation

```

Can you implement below ai agent 

pre req: i want to make the plan_summary as json field in thread context




Create the Travel Planning Agent:
Develop a new agent named travel-planning-agent in the AI-services module.
This agent will handle travel plan creation and updates dynamically based on user conversations.
It consists of two main sub-components: a planning sub-agent (for generating or updating the travel plan) and a user response evaluation sub-agent (for processing user inputs and determining next steps/questions).

Integrate with Chat API:
Modify the /:userId/:threadId/stream endpoint in services\api-service\src\routes\chatRoutes.ts.
Instead of using hardcoded responses from the responses variable, forward incoming user messages to the travel-planning-agent.
The agent will process the user's conversation history (including the latest message) and the current plan summary (retrieved from thread_contexts > plan_summary in the database).
Return the agent's generated response back to the user via the API.

Agent Input Handling:
On each API request, pass to the agent:
Full user conversation history.
Current travel plan summary (if it exists in the DB; otherwise, it's null or empty).

The agent first evaluates if a plan exists and if the latest user message indicates any changes or a full replan.

Planning Sub-Agent Logic:
Trigger this sub-agent if:
No plan exists.
The user requests a replan (e.g., major changes to the itinerary).
The latest message implies structural changes to the existing plan.

Functionality:
Analyze the user's utterances to infer travel intent.
Generate a short summary of the travel plan.
Create a list of required user variables (fields like visa status, number of travelers, food preferences).
Categorize fields as "mandatory" or "optional".
Populate values from conversation history if available; otherwise, set to "NOT_AVAILABLE".


Output format (JSON):text{
  "travel_summary": "SUMMARY OF USER TRAVEL",
  "user_variables": [
    {
      "field_name": "visa status of user",
      "value": "Visa available",
      "type": "mandatory"
    },
    {
      "field_name": "no of users",
      "type": "mandatory",
      "value": "NOT_AVAILABLE"
    },
    {
      "field_name": "food preference",
      "type": "optional",
      "value": "NOT_AVAILABLE"  // Default if not provided
    }
  ]
}

User Response Evaluation Sub-Agent Logic:
Trigger this after the planning sub-agent (or directly if no planning is needed).
Input: User conversation history and the (updated) plan details.
Functionality:
Evaluate the latest user input against the plan's required variables.
Fill in any new values from the user's message.
Determine if the plan is complete (no mandatory fields left as "NOT_AVAILABLE").
Identify the next question to ask the user (e.g., for the next unfilled mandatory field).
Handle edge cases: If the user's message is irrelevant or "dummy" (off-topic), respond politely asking for correction or relevant info.

Output format (JSON, to be returned via API):text{
  "plan_updated": true/false,  // Whether the plan or fields were modified in this call
  "plan_summary": {
    // Full details of the travel plan, including summary and populated variables
  },
  "plan_ready": true/false,  // True if all mandatory fields are filled; false if more input needed
  "user_input": {
    "value": "// Next question or prompt for the user (e.g., 'How many people are traveling?')"
  }
}

Overall Agent Flow:
Entry point: travel-planning-agent receives request.
Check for replan or irrelevant input:
If replan needed or no plan: Route to planning sub-agent.
If irrelevant: Generate a corrective response directly.
Otherwise: Route to user response evaluation sub-agent.

After processing, update the plan summary in the DB (thread_contexts > plan_summary).
Return the evaluation sub-agent's output as the API response.

Edge Case Handling:
If user input is playful or off-topic, don't trigger planning; instead, nudge back to relevant questions.
Ensure the agent uses a "good model" (e.g., a capable LLM like GPT-4 or equivalent) for planning to generate accurate, context-aware plans.


My Ideas and Suggestions
To make this agent more robust, scalable, and user-friendly, here are some additional ideas I've added based on best practices for conversational AI agents. These build on the original design without changing its core, focusing on reliability, user experience, and maintainability:

Enhance Input Validation and Error Handling:
Add preprocessing in the agent to sanitize user inputs (e.g., handle typos, detect sentiment for frustration, or filter out spam).
Implement fallback responses: If the agent can't parse intent (e.g., ambiguous message), default to clarifying questions like "Could you please rephrase that?" instead of failing silently.
Track conversation state: Use a state machine within the agent to remember the last asked question, preventing repetitive prompts if the user ignores them.

Improve Plan Structure and Extensibility:
Expand the user_variables list with more dynamic fields: Based on inferred intent, auto-add context-specific ones (e.g., "budget range" for cost-sensitive trips, "accessibility needs" for inclusive planning). Use ML to suggest fields intelligently.
Make summaries more detailed: Include sections like "itinerary outline", "estimated costs", or "potential risks" (e.g., weather, visa requirements) to make the plan more comprehensive.
Versioning for plans: Store plan versions in the DB to allow users to revert changes or compare options.

Integration with External Services:
Hook into APIs for real-time data: After gathering basics, query services like Google Flights, Booking.com, or weather APIs to enrich the plan (e.g., suggest flights if dates are provided).
Multi-modal support: If users upload images (e.g., passport scans for visa), integrate tools to extract info automatically.

User Experience Enhancements:
Personalization: Use user profile data (if available) to pre-fill variables (e.g., from past trips).
Progressive disclosure: For complex plans, break questions into stages (e.g., first basics like dates/destination, then preferences).
Multilingual support: Detect user language and adapt responses/plans accordingly.
Feedback loop: After plan completion (plan_ready: true), ask for confirmation before finalizing.

Performance and Security:
Caching: Store intermediate plan states in memory (e.g., Redis) for faster API responses in ongoing threads.
Rate limiting: Prevent abuse by limiting agent calls per user/session.
Privacy: Ensure sensitive data (e.g., visa status) is encrypted in DB and not logged.
Testing: Add unit tests for sub-agents (e.g., mock conversations) and end-to-end integration tests with the API.

Monitoring and Iteration:
Logging: Track agent decisions (e.g., why it triggered planning) for debugging.
Analytics: Measure completion rates, user drop-offs, and plan accuracy to refine the LLM prompts over time.


These ideas aim to make the agent more intelligent and production-ready while keeping it aligned with the original requirements.
Well-Curated Agent Plan
Below is a comprehensive, curated plan for the travel-planning-agent. I've structured it as a high-level architecture diagram (in text form), followed by pseudocode for the flow, detailed sub-agent specs, and implementation notes. This serves as a blueprint for development.
Architecture Overview (Text Diagram)
textAPI Request (/stream) → [User Message + Conversation History + Current Plan Summary from DB]

↓

Travel-Planning-Agent (Main Orchestrator)
├── Evaluate: Plan exists? Changes requested? Irrelevant input?
│   ├── Yes changes/no plan → Planning Sub-Agent
│   │   ├── Generate/Update Plan Summary + Variables
│   │   └── Output JSON (summary + variables)
│   ├── Irrelevant → Direct Response: "Please provide relevant info"
│   └── No changes → Skip to Evaluation
└── User-Response-Evaluation Sub-Agent
    ├── Fill Variables from Latest Message
    ├── Check Completeness (All mandatory filled?)
    ├── Generate Next Question
    └── Output JSON (updated plan + next prompt)

↓

Update DB (thread_contexts > plan_summary)

↓

API Response (Stream back to user)
```