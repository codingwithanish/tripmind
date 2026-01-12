# Timeline Page – Complete UX & WebSocket Specification

* * *

## 1. Purpose

The Timeline Page visually represents the user’s travel plan as a **story-driven, interactive, vertical timeline**, continuously updated in real time via **WebSocket events**.  
It allows users to:

* Understand the trip flow
    
* Act on tasks
    
* Review recommendations
    
* Provide additional context via chat
    
* Refine the plan dynamically
    

* * *

## 2. Entry Point & Lifecycle

### 2.1 Entry Condition

* User clicks the **Readiness / Planning button** (enabled state)
    
* Redirects to `/timeline`
    

### 2.2 Data Initialization

* Frontend opens a **WebSocket connection**
    
* Backend sends a `complete-timeline` event
    
* Frontend:
    
    * Clears any existing timeline state
        
    * Rebuilds the entire timeline from scratch
        

* * *

## 3. Responsive Layout

### 3.1 Desktop Layout (Split View)

| Area | Content |
| --- | --- |
| Left Pane | Vertical D3 Timeline |
| Right Pane | Chat Interface |

* Both panes are visible simultaneously
    
* Independent vertical scrolling
    
* Timeline remains the primary visual focus
    

* * *

### 3.2 Mobile Layout (Tabbed View)

* Two **sticky tabs** at the top:
    
    1. **Timeline** (default)
        
    2. **Chat**
        
* Tabs are:
    
    * Compact
        
    * Always visible
        
    * Non-scrollable
        
* Only one tab’s content is visible at a time
    

* * *

## 4. Timeline Core Structure

### 4.1 Timeline Spine

* Single **vertical spine**
    
* Spine can visually shift:
    
    * **Left aligned**
        
    * **Right aligned**
        
* At any time, **only one side is active**
    

* * *

## 5. Default Visibility & Gesture Rules

### 5.1 Default State

* **Tasks are visible by default**
    
* Spine aligned to show task cards
    
* Recommendations are hidden
    

### 5.2 Swipe Interaction (Touch Devices)

| Gesture | Result |
| --- | --- |
| Swipe Left → Right | Show Recommendations |
| Swipe Right → Left | Show Tasks |

Rules:

* Tasks and recommendations never show together
    
* Spine animates smoothly between sides
    
* Swipe disabled when:
    
    * Node subtype is `tasks_only`
        
    * Node subtype is `recommendation_only`
        
    * Node is `representation_node`
        
    * Node is `additional_input`
        

* * *

## 6. Timeline Nodes – Common Properties

Each node contains:

* `id` (UUID)
    
* `order`
    
* `node_version`
    
* `type`
    
* `subtype`
    
* `display_date`
    

Each node renders as:

* A **spine marker**
    
* Optional **date label**
    
* Optional **content cards**
    

* * *

## 7. Node Types & UX Behavior

* * *

### 7.1 Start Node

* Exactly one per timeline
    
* Always first
    
* Visual marker only
    
* No cards, no interactions
    

* * *

### 7.2 End Node

* Exactly one per timeline
    
* Always last
    
* Visual marker only
    

* * *

### 7.3 Task Node (`task_node`)

Represents actionable planning steps.

#### Default Behavior

* Tasks are shown by default
    
* Recommendations available via swipe (if present)
    

#### Task Card Contents

* Image
    
* Description
    
* Cost (if applicable)
    
* Execution status:
    
    * `pending`
        
    * `in_progress`
        
    * `completed`
        
    * `skipped`
        

* * *

### 7.4 Task Node Subtypes

| Subtype | UX Behavior |
| --- | --- |
| `default` | Tasks visible, recommendations via swipe |
| `tasks_only` | Tasks only, swipe disabled |
| `recommendation_only` | Recommendations only |
| `additional_input` | Blocks timeline (see section 9) |

* * *

### 7.5 Representation Node (`representation_node`)

Used for **contextual information only**.

Examples:

* Weather
    
* Location state
    
* Alerts
    

Behavior:

* Displays image + short description
    
* No tasks
    
* No recommendations
    
* No swipe
    
* Click opens **read-only modal**
    

* * *

## 8. Recommendations UX

### 8.1 Recommendation Card

Each recommendation includes:

* Image
    
* Description
    
* Optional cost
    
* Priority ordering
    
* Action icons
    

### 8.2 Recommendation Actions

| Action | Result |
| --- | --- |
| Accept | Converted into a task |
| Ignore | Deprioritized visually |

Conversion triggers a WebSocket `update-node-element` event.

* * *

## 9. Additional Input Nodes (Blocking Nodes)

### Purpose

Collects mandatory missing information.

### UX Behavior

* Timeline visually pauses
    
* Node highlighted
    
* Swipe disabled
    
* Chat auto-focuses on the question
    
* Readiness progress may pause
    

Timeline progression resumes only after input is provided.

* * *

## 10. Date & Time Display

Each node supports:

* Date
    
* Date range
    
* Time
    
* Time range
    

Rendered using:

* `display_date.type`
    
* `display_date.label`
    

* * *

## 11. Cost Display Rules

* Shown only if `price_included = true`
    
* Supported types:
    
    * Range
        
    * Constant
        
    * Confirmed
        
* Currency and formatting follow timeline `configs`
    

* * *

## 12. Chat Integration (Timeline Page)

* Chat is always available:
    
    * Desktop: right pane
        
    * Mobile: second tab
        
* User can continue chatting to:
    
    * Add context
        
    * Refine plans
        
* Chat responses can mutate the timeline via WebSocket
    

* * *

## 13. WebSocket Event Handling (Authoritative)

* * *

### 13.1 `complete-timeline`

**Purpose:** Full rebuild

Frontend behavior:

* Clear existing state
    
* Rebuild timeline
    
* Reset versions
    

* * *

### 13.2 `new-node`

**Purpose:** Insert node

Rules:

* Insert relative to `above_node_id` or `after_node_id`
    
* Animate insertion
    
* Respect version ordering
    

* * *

### 13.3 `delete-node`

**Purpose:** Remove node

Rules:

* Animate removal
    
* Reconnect spine visually
    

* * *

### 13.4 `add-node-element`

**Purpose:** Add recommendation / task / input

Rules:

* Insert based on priority
    
* Animate card entry
    

* * *

### 13.5 `update-node-element`

**Purpose:** Partial update

Examples:

* Task completion
    
* Price confirmation
    
* Recommendation → Task conversion
    

Rules:

* Patch only specified fields
    
* Animate state change
    

* * *

### 13.6 `delete-node-element`

**Purpose:** Remove elements

Rules:

* Remove cards cleanly
    
* Update layout spacing
    

* * *

### 13.7 Versioning Rules (Mandatory)

* Ignore events with lower `version`
    
* Ignore stale `node_version`
    
* Timeline ID must match active timeline
    

* * *

## 14. Readiness & Progress (Context Awareness)

* Progress is computed outside timeline logic
    
* Timeline reacts passively to updates
    
* Additional input nodes may pause readiness
    

* * *

## 15. Empty & Edge States

| Case | UX |
| --- | --- |
| Node has no tasks | Show “No tasks yet” |
| Node has recommendations only | Swipe hint |
| No recommendations exist | Swipe disabled |
| WebSocket disconnect | Freeze UI + reconnect |

* * *

## 16. Animation & Feedback Guidelines

* Spine movement: smooth, spring-based
    
* Card insertion/removal: fade + slide
    
* Swipe transitions: ≤ 250ms
    
* No abrupt jumps
    

* * *

## 17. UX Principles (Final)

* Tasks first, recommendations second
    
* One clear focus at a time
    
* Chat and timeline stay synchronized
    
* Timeline tells a **story**, not a checklist
    
* User always understands _why_ something appears
    

* * *

## 18. What This Specification Enables

* ✅ Real-time AI-driven planning
    
* ✅ Incremental refinement
    
* ✅ Mobile-first gestures
    
* ✅ Clean D3 rendering
    
* ✅ Long-term scalability
    
* ✅ Clear developer ownership
    
