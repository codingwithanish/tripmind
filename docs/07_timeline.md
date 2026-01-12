## Timeline Page – UX & Layout Specification

### 1. Navigation to Timeline Page

* When the user clicks the **Readiness / Planning button** in the chat (only when it is in the ready state):
    
    * The user is redirected to a new page called **Timeline**
        

* * *

## 2. Desktop View (Split Layout)

### 2.1 Layout Structure

* The Timeline page uses a **split-screen layout**:
    

#### Left Panel

* Contains the **travel timeline chart**
    
* Timeline is:
    
    * **Vertical**
        
    * Built using **D3.js**
        
    * Displays the full travel plan in chronological order
        

#### Right Panel

* Contains a **chat window**
    
* Allows the user to:
    
    * Provide additional travel context
        
    * Refine or update the travel plan
        
* Chat behavior remains the same as the previous chat page (input field at the bottom, streamed responses, suggestions, etc.)
    

* * *

### 2.2 Interaction Behavior (Desktop)

* The timeline and chat are visible **simultaneously**
    
* Any new context provided in the chat:
    
    * Can be used to refine or update the timeline dynamically (or on refresh, depending on implementation)
        
* Scrolling:
    
    * Timeline panel scrolls independently
        
    * Chat panel scrolls independently
        

* * *

## 3. Mobile View (Tabbed Layout)

### 3.1 Tab Structure

* The Timeline page displays **two tabs at the top**:
    
    1. **Timeline**
        
    2. **Chat**
        
* Tabs must be:
    
    * **Small / compact in height**
        
    * **Static (sticky) at the top**
        
    * Always visible while scrolling
        

* * *

### 3.2 Default Tab Behavior

* **Timeline** is the default and first active tab
    
* Only one tab’s content is visible at a time:
    
    * Timeline tab → shows the timeline chart
        
    * Chat tab → shows the chat window
        

* * *

### 3.3 Timeline Tab (Mobile)

* Displays the **vertical D3-based timeline**
    
* Optimized for mobile scrolling and touch interaction
    

* * *

### 3.4 Chat Tab (Mobile)

* Displays the chat interface
    
* Allows the user to:
    
    * Continue providing additional information
        
    * Ask questions or refine the plan
        

* * *

## 4. Common Timeline Characteristics (All Devices)

* Timeline is:
    
    * Vertical
        
    * Chronologically ordered
        
    * Constructed using **D3**
        
* Each timeline item may represent:
    
    * Travel preparation
        
    * Bookings
        
    * Activities
        
    * Dates
        
    * Cost-related milestones
        

* * *

## 5. Context Refinement Flow

* The chat on the Timeline page remains **active**
    
* Users can:
    
    * Add more details
        
    * Adjust preferences
        
* These inputs can be used to:
    
    * Enhance
        
    * Update
        
    * Recalculate the timeline (implementation-dependent)
        

* * *

## 6. Responsive Behavior Summary

| Device | Layout Type | Timeline | Chat |
| --- | --- | --- | --- |
| Desktop | Split-screen | Left | Right |
| Mobile | Two-tab interface | Tab 1 | Tab 2 |

* * *

## 7. UX Principles

* Timeline is always the **primary view**
    
* Chat remains accessible at all times
    
* No navigation away from the Timeline page is required to refine the plan
    
* Layout adapts cleanly without losing context
    
