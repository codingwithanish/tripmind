
## Chat Page – Readiness Button & Progress Indicator Specification

### 1. Readiness / Planning Button Placement

* On the **chat page**, a **Planning (Readiness) button** must appear **next to the Send button**
    
* This button is **always visible** but starts in a **disabled / loading state**
    

* * *

## 2. Readiness Button – Visual States

### 2.1 Default State (Initial)

* Button color: **Black**
    
* Icon/Image: **Monochrome (disabled style)**
    
* State: **Inactive**
    
* Purpose: Indicates the system is still **collecting context**
    

* * *

### 2.2 Progress State (Context Being Collected)

* The button shows a **progress bar along its edges**
    
    * Progress visually fills the border (outline-style progress)
        
* Button background remains **black**
    
* Icon remains **monochrome**
    
* Meaning:
    
    * The system is actively collecting travel context
        
    * More user input improves the plan quality
        

* * *

### 2.3 Completed State (100% Context Collected)

* When progress reaches **100%**:
    
    * Edge progress bar becomes **fully bright**
        
    * Button background changes to **colored**
        
    * Button icon/image becomes **colored**
        
* Button becomes **clickable**
    
* Meaning:
    
    * Required information is fully collected
        
    * Timeline generation is ready
        

* * *

## 3. Chat Message Trigger on Completion

When the progress reaches **100%**, the system must automatically send a chat message saying:

> “We have collected the required information to create your primary travel plan.  
> Click the planning button to view your timeline.  
> You can also continue chatting to provide additional details, and the plan will be refined based on that information.”

* * *

## 4. User Behavior After Completion

* Even after the planning button is enabled:
    
    * User can continue chatting
        
    * Additional messages can further enhance or refine the travel plan
        
* Clicking the planning button:
    
    * Redirects the user to the **Timeline Page**
        

* * *

## 5. Streaming API Change (Important)

### 5.1 Removed Response Type

* ❌ **`status_change` response type must be removed**
    
* Timeline readiness must **not** be handled as a separate message type
    

* * *

### 5.2 Updated Streaming Response Format

Each streamed response of type `chat_response` must include an additional field:

```json
{
  "type": "chat_response",
  "content": "When are you planning to travel?",
  "timeline_context_collected": 40
}
```

#### Field Definition:

* `timeline_context_collected`
    
    * Type: Integer
        
    * Range: `0–100`
        
    * Represents how much required context has been collected
        
    * `100` means timeline is ready to generate
        

* * *

## 6. Frontend Progress Handling

* The frontend must:
    
    * Read `timeline_context_collected` from **every streamed response**
        
    * Update the readiness button’s **edge progress bar** accordingly
        
* Progress behavior:
    
    * Gradual increase as chat continues
        
    * Never decreases
        
    * Caps at `100`
        

* * *

## 7. Dummy Data / Temporary Backend Logic

Since dummy data is currently used:

* Implement a **counter-based progression**
    
* Example logic:
    
    * If the number of `/api/chat/{thread_id}/conversations` calls reaches **5**:
        
        * Set `timeline_context_collected = 100`
            
* Otherwise:
    
    * Increase progress incrementally with each API call
        
    * Example:
        
        * Call 1 → 20%
            
        * Call 2 → 40%
            
        * Call 3 → 60%
            
        * Call 4 → 80%
            
        * Call 5 → 100%
            

This logic is **temporary** and will later be replaced by real context-evaluation logic.

* * *

## 8. Summary of Behavior

1. Planning button is always visible but disabled
    
2. Edge progress bar reflects context collection
    
3. Progress updates come from every streamed chat response
    
4. At 100%:
    
    * Button becomes active and colored
        
    * System sends a readiness confirmation message
        
5. User can either:
    
    * Generate the timeline
        
    * Continue chatting for refinement
        
