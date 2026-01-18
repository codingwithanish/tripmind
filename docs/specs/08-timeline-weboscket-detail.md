# Timeline WebSocket Elements – Detailed Characteristics

* * *

## 1. Top-Level WebSocket Message

```json
{
  "type": "complete-timeline",
  "data": { ... }
}
```

### `type`

**Purpose**

* Identifies the kind of timeline mutation or state update
    

**Characteristics**

* Determines how the frontend processes the message
    
* Must be one of the predefined event types
    
* Frontend must use a strict switch-case (or equivalent)
    

**UX Impact**

* Controls whether the timeline is rebuilt, incrementally updated, or partially patched
    

* * *

### `data`

**Purpose**

* Contains the payload specific to the event type
    

**Characteristics**

* Schema varies based on `type`
    
* Always contains `timeline_id`
    
* Must be treated as immutable input
    

* * *

## 2. Timeline-Level Elements

* * *

### `timeline_id`

```json
"timeline_id": "uuid"
```

**Purpose**

* Uniquely identifies a timeline instance
    

**Characteristics**

* UUID
    
* Shared across all WebSocket messages for the same plan
    
* Required for multi-tab or multi-plan scenarios
    

**Frontend Rule**

* Ignore messages whose `timeline_id` does not match the active timeline
    

* * *

### `version`

```json
"version": 12
```

**Purpose**

* Global version counter for the timeline
    

**Characteristics**

* Monotonically increasing integer
    
* Increments on every mutation
    
* Represents authoritative ordering
    

**Frontend Rule**

* Ignore messages with lower versions
    
* Prevents race conditions and stale updates
    

**UX Impact**

* Guarantees visual consistency during rapid updates
    

* * *

### `style`

```json
"style": "default"
```

**Purpose**

* Controls the **entire visual appearance** of the timeline
    

**Characteristics**

* Single identifier referencing a UI style definition
    
* Encapsulates:
    
    * Node shapes
        
    * Spine thickness
        
    * Colors
        
    * Animations
        
    * Gradients
        

**UX Impact**

* Allows theme switching (e.g., seasonal, dark mode) without code changes
    

* * *

### `configs`

```json
"configs": {
  "display_price_unit": "INR",
  "timezone": "Asia/Kolkata"
}
```

**Purpose**

* Timeline-specific configuration settings
    

**Characteristics**

* Affects rendering behavior, not structure
    
* Extendable without breaking schema
    

**Common Uses**

* Currency formatting
    
* Timezone normalization
    
* Precision rules
    

* * *

## 3. Node Object (Core Timeline Unit)

```json
{
  "id": "uuid",
  "node_version": 2,
  "order": 3,
  "type": "task_node",
  "subtype": "default"
}
```

* * *

### `id`

**Purpose**

* Unique identifier for a node
    

**Characteristics**

* UUID
    
* Stable for the lifetime of the node
    

**UX Impact**

* Used for animations, focus, and targeted updates
    

* * *

### `node_version`

```json
"node_version": 2
```

**Purpose**

* Versioning at node level
    

**Characteristics**

* Incremented whenever node content changes
    
* Independent of timeline version
    

**Frontend Rule**

* Ignore node updates with older `node_version`
    

* * *

### `order`

```json
"order": 3
```

**Purpose**

* Determines vertical position in the timeline
    

**Characteristics**

* Integer
    
* Start node = lowest
    
* End node = highest
    

**UX Impact**

* Controls chronological flow
    

* * *

### `type`

```json
"type": "start | end | task_node | representation_node"
```

**Purpose**

* Defines the semantic role of the node
    

**Characteristics**

* Strict enum
    
* Determines allowed child elements
    

| Type | Characteristics |
| --- | --- |
| `start` | Visual marker only |
| `end` | Visual marker only |
| `task_node` | Holds tasks/recommendations |
| `representation_node` | Context-only |

* * *

### `subtype`

```json
"subtype": "default | tasks_only | recommendation_only | additional_input"
```

**Purpose**

* Refines behavior of a node
    

**Characteristics**

* Controls:
    
    * Swipe availability
        
    * Content visibility
        
    * Interaction rules
        

**UX Impact**

* Enables progressive disclosure and blocking behavior
    

* * *

## 4. `display_date`

```json
"display_date": {
  "type": "date_range",
  "label": "Jan 10 – Jan 12",
  "start": "...",
  "end": "..."
}
```

### `type`

**Purpose**

* Defines time semantics
    

**Characteristics**

* Enum-based rendering logic
    

* * *

### `label`

**Purpose**

* Human-readable display string
    

**Characteristics**

* Backend-controlled
    
* Frontend displays as-is
    

* * *

### `start` / `end`

**Purpose**

* Machine-readable timestamps
    

**Characteristics**

* ISO format
    
* Used for calculations and ordering
    

* * *

## 5. Recommendation Object

```json
{
  "id": "uuid",
  "action_state": "suggested",
  "priority": 1
}
```

* * *

### `action_state`

```json
"suggested | accepted | rejected | converted_to_task"
```

**Purpose**

* Tracks lifecycle of a recommendation
    

**UX Impact**

* Drives animations and card transitions
    
* Prevents duplicate task creation
    

* * *

### `priority`

**Purpose**

* Determines display order
    

**Characteristics**

* Lower value = higher priority
    
* Dynamic ordering supported
    

* * *

### `price_included`

**Purpose**

* Indicates cost relevance
    

**UX Impact**

* Controls visibility of pricing UI
    

* * *

### `price_info`

**Purpose**

* Encapsulates all cost details
    

**Characteristics**

* Self-contained
    
* Supports range and fixed pricing
    

* * *

## 6. Task Object

```json
{
  "id": "uuid",
  "execution_state": "pending",
  "visit_status": "confirmed"
}
```

* * *

### `execution_state`

```json
"pending | in_progress | completed | skipped"
```

**Purpose**

* Tracks task execution lifecycle
    

**UX Impact**

* Visual status indicators
    
* Progress representation
    

* * *

### `visit_status`

```json
"confirmed | waitinglist | no_action"
```

**Purpose**

* Booking or reservation state
    

**UX Impact**

* Icons and color codes
    

* * *

### `price`

**Purpose**

* Task-specific cost information
    

**Characteristics**

* Supports confirmed prices
    
* Overrides estimates when finalized
    

* * *

## 7. Additional Input Object

```json
{
  "question": "What kind of travel do you prefer?",
  "response_type": "text"
}
```

**Purpose**

* Blocks timeline progression until answered
    

**Characteristics**

* Acts as a hard dependency
    
* Linked to chat input
    

**UX Impact**

* Timeline pause
    
* Focus shift to chat
    

* * *

## 8. WebSocket Mutation Events (Characteristics)

* * *

### `new-node`

* Adds chronological structure
    
* Must animate insertion
    
* Affects order recalculation
    

* * *

### `add-node-element`

* Adds content within node
    
* Non-destructive
    
* Priority-based placement
    

* * *

### `update-node-element`

* Partial mutation
    
* Preferred over delete + add
    
* Enables smooth UX transitions
    

* * *

### `delete-node-element`

* Removes specific items
    
* Leaves node intact
    

* * *

### `delete-node`

* Structural mutation
    
* Requires spine reflow
    

* * *

## 9. Frontend Safety Characteristics

* Timeline is **event-sourced**
    
* Backend is authoritative
    
* Frontend is deterministic
    
* No speculative UI mutations
    

* * *

## 10. Why This Model Works

* Scales with AI reasoning
    
* Supports streaming intelligence
    
* Handles uncertainty gracefully
    
* Keeps UX clean and understandable
    

* * *