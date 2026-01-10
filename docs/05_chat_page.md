# UX & Functional Specification – Chat Page & Timeline Trigger

## 1. Chat Page Entry

* When the user clicks the **Send / Arrow button** on the Home Page card:
    
    * The user is redirected to the **Chat Page**
        
    * The chat opens with the **exact sentence entered by the user** as the first message
        

* * *

## 2. Chat Page Layout

### 2.1 Main Layout

The Chat Page consists of three primary sections:

1. **Chat Conversation Area**
    
    * Displays messages in a conversational format
        
    * Includes:
        
        * User messages
            
        * System (assistant) questions and responses
            
2. **Suggestion Area (Above Input)**
    
    * Displays **contextual answer suggestions**
        
    * Suggestions change dynamically based on the current question
        
3. **Chat Input Area (Bottom)**
    
    * Fixed at the bottom of the screen
        
    * Contains:
        
        * A **text input field**
            
        * A **Send button** on the right side
            

* * *

## 3. System Question Flow

* The system asks **follow-up questions** to collect missing travel details, such as:
    
    * Travel dates
        
    * Budget
        
    * Number of travelers
        
    * Preferences (luxury, budget, sightseeing, etc.)
        
* Questions are asked **one at a time**
    
* The system determines the next question based on:
    
    * Previously collected answers
        
    * Required information for building a travel plan
        

* * *

## 4. Answer Suggestions Behavior

* Above the chat input field, the system displays **suggested responses**
    
* Suggestions are shown as **clickable chips / buttons**
    
    * Example: `< 10k`, `10k–50k`, `No budget limit`
        
* User can:
    
    * Tap a suggestion to auto-fill and send the response
        
    * Ignore suggestions and type a custom answer
        

* * *

## 5. Chat Input Behavior

* Users can:
    
    * Type a custom answer in the text field
        
    * Send the message using the **Send button**
        
* After sending:
    
    * The input field is cleared
        
    * The message appears in the chat history
        
    * The system responds with the next question or action
        

* * *

## 6. Readiness Detection for Timeline Generation

* The system continuously evaluates whether:
    
    * All **required travel details** have been collected
        
* Once the system determines that sufficient information is available:
    
    * A new button appears **next to the Send button**
        

### Button Label:

**“Generate Travel Timeline”** (or similar)

* * *

## 7. Generate Timeline Action

* The **Generate Travel Timeline** button:
    
    * Is hidden until all required data is collected
        
    * Becomes visible only when the system is ready
        
* When the user clicks this button:
    
    * The current chat state is finalized
        
    * The user is redirected to the **Timeline Page**
        

* * *

## 8. Timeline Page Transition

* On redirect:
    
    * The system uses all collected chat data
        
    * Builds a **graphical travel timeline**
        
    * Displays:
        
        * Travel phases
            
        * Dates
            
        * Activities
            
        * Estimated costs
            
        * Recommendations
            

* * *

## 9. Edge & UX Rules

* If the user edits or changes an earlier answer:
    
    * The system may:
        
        * Ask follow-up clarification questions
            
        * Re-evaluate timeline readiness
            
* If required data becomes incomplete again:
    
    * The **Generate Travel Timeline** button is hidden
        

* * *

## 10. Visual Reference

The layout, input positioning, suggestion chips, and button behavior should closely follow the attached wireframe images.

## Internal Chat API Specification

### 1. Chat Thread Initialization

* When the user clicks a **conversation card** on the Home Page:
    
    * The frontend must call the following API:
        

```
POST /api/chat/threads
```

* This API:
    
    * Creates a new chat thread
        
    * Returns a unique **thread ID**
        

#### Response Example:

```json
{
  "thread_id": "abc123"
}
```

* This `thread_id` is used to associate **all subsequent chat interactions** for that session.
    

* * *

## 2. Sending Messages in a Chat Thread

* When the user types a message in the chat input and clicks **Send**:
    
    * The frontend must call:
        

```
POST /api/chat/{thread_id}/conversations
```

* The request includes:
    
    * The user’s message text
        
    * Any required metadata (if applicable)
        

* * *

## 3. Streaming Response Behavior

* The `/api/chat/{thread_id}/conversations` endpoint returns a **streamed JSON response**
    
* The frontend must handle and render the response **incrementally** as it arrives
    

* * *

## 4. Streaming Response Types

Each streamed JSON message can be one of the following types:

### 4.1 Chat Response

Used to display system messages in the chat conversation.

```json
{
  "type": "chat_response",
  "content": "When are you planning to travel?"
}
```

* Rendered as a **system/assistant message** in the chat UI
    

* * *

### 4.2 Suggestions

Used to show contextual answer suggestions above the chat input field.

```json
{
  "type": "suggestions",
  "content": [
    "< 10k",
    "10k - 50k",
    "No budget limit"
  ]
}
```

* Displayed as **clickable suggestion chips**
    
* Clicking a suggestion:
    
    * Sends it as the user’s response
        
    * Triggers the same conversation API
        

* * *

### 4.3 Status Change (Timeline Readiness)

Used to indicate whether enough information has been collected to generate the travel timeline.

```json
{
  "type": "status_change",
  "content": {
    "timeline_ready": true
  }
}
```

#### Frontend Behavior:

* When `timeline_ready = true`:
    
    * Show the **“Generate Travel Timeline”** button next to the Send button
        
* When `timeline_ready = false`:
    
    * Hide the button (if visible)
        

* * *

## 5. Conversation Lifecycle Summary

1. User clicks a Home Page card
    
2. `/api/chat/threads` is called → returns `thread_id`
    
3. All chat messages use `/api/chat/{thread_id}/conversations`
    
4. Responses are streamed and rendered in real time
    
5. Suggestions and readiness signals are handled dynamically
    
6. Once timeline readiness is confirmed, the user can proceed to timeline generation
    

* * *

## 6. Error & Edge Handling

* If streaming is interrupted:
    
    * The frontend should preserve existing messages
        
    * Retry or show an error state
        
* If an invalid `thread_id` is used:
    
    * Backend returns an error
        
    * Frontend redirects user back to Home Page
        
