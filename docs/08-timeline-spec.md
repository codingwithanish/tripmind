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

### 13.0 WebSocket Response Structure

The `complete-timeline` response contains the full timeline data. Node types are:

| Type | Contains | Description |
| --- | --- | --- |
| `start` | None | Trip start marker |
| `end` | None | Trip end marker |
| `action` | `tasks` and/or `recommendations` | Actionable planning steps |
| `representation` | Single `representation` object | Contextual info (weather, alerts) |
| `additional_input` | Single `additional_input` object | Blocking user input request |

#### Complete Response Example

```json
{
  "type": "complete-timeline",
  "data": {
    "timeline_id": "550e8400-e29b-41d4-a716-446655440000",
    "version": 12,
    "style": "default",
    "configs": {
      "display_price_unit": "INR",
      "timezone": "Asia/Kolkata"
    },
    "nodes": [
      {
        "id": "node-001",
        "node_version": 1,
        "order": 1,
        "type": "start",
        "subtype": null,
        "display_date": {
          "type": "date",
          "label": "Jan 10, 2026",
          "start": "2026-01-10T00:00:00+05:30"
        }
      },
      {
        "id": "node-002",
        "node_version": 1,
        "order": 2,
        "type": "representation",
        "subtype": "weather",
        "display_date": {
          "type": "date_range",
          "label": "Jan 10 – Jan 12",
          "start": "2026-01-10T00:00:00+05:30",
          "end": "2026-01-12T00:00:00+05:30"
        },
        "representation": {
          "id": "rep-001",
          "title": "Perfect Beach Weather",
          "description": "Expect sunny skies with temperatures around 28°C",
          "icon": "sun",
          "image": "https://example.com/weather.jpg"
        }
      },
      {
        "id": "node-003",
        "node_version": 3,
        "order": 3,
        "type": "action",
        "subtype": "default",
        "display_date": {
          "type": "date_range",
          "label": "Jan 10 – Jan 12",
          "start": "2026-01-10T00:00:00+05:30",
          "end": "2026-01-12T00:00:00+05:30"
        },
        "tasks": [
          {
            "id": "task-001",
            "execution_state": "completed",
            "visit_status": "confirmed",
            "priority": 1,
            "title": "Book Flight to Goa",
            "title_image": "https://example.com/flight.jpg",
            "description": "IndiGo 6E-2034, Departure 6:00 AM from Mumbai",
            "price": {
              "type": "confirmed",
              "unit": "INR",
              "confirmed_price": 4500
            }
          },
          {
            "id": "task-002",
            "execution_state": "pending",
            "visit_status": "waitinglist",
            "priority": 2,
            "title": "Check into Resort",
            "description": "Taj Exotica - Check-in after 2 PM",
            "price": {
              "type": "range",
              "unit": "INR",
              "price_range": {
                "min": 12000,
                "max": 18000
              }
            }
          }
        ],
        "recommendations": [
          {
            "id": "rec-001",
            "action_state": "suggested",
            "type": "restaurant",
            "priority": 1,
            "title": "Fisherman's Wharf",
            "title_image": "https://example.com/restaurant.jpg",
            "description": "Famous seafood restaurant with ocean views",
            "price_included": true,
            "price_info": {
              "type": "range",
              "unit": "INR",
              "range": {
                "min": 800,
                "max": 2000
              }
            }
          },
          {
            "id": "rec-002",
            "action_state": "accepted",
            "type": "place",
            "priority": 2,
            "title": "Dudhsagar Waterfalls",
            "description": "Scenic waterfall trip - best visited in monsoon",
            "price_included": false
          }
        ]
      },
      {
        "id": "node-004",
        "node_version": 2,
        "order": 4,
        "type": "action",
        "subtype": "tasks_only",
        "display_date": {
          "type": "date",
          "label": "Jan 13, 2026",
          "start": "2026-01-13T00:00:00+05:30"
        },
        "tasks": [
          {
            "id": "task-003",
            "execution_state": "pending",
            "visit_status": null,
            "priority": 1,
            "title": "Water Sports Session",
            "description": "Jet skiing and parasailing at Baga Beach",
            "price": {
              "type": "confirmed",
              "unit": "INR",
              "confirmed_price": 3500
            }
          }
        ]
      },
      {
        "id": "node-005",
        "node_version": 1,
        "order": 5,
        "type": "additional_input",
        "subtype": null,
        "display_date": null,
        "additional_input": {
          "id": "input-001",
          "question": "What kind of activities do you prefer - adventure or relaxation?",
          "response_type": "text",
          "placeholder": "E.g., water sports, spa, sightseeing...",
          "is_required": true
        }
      },
      {
        "id": "node-006",
        "node_version": 1,
        "order": 6,
        "type": "end",
        "subtype": null,
        "display_date": {
          "type": "date",
          "label": "Jan 15, 2026",
          "start": "2026-01-15T00:00:00+05:30"
        }
      }
    ]
  }
}
```

#### Action Node Subtypes

| Subtype | Behavior |
| --- | --- |
| `default` | Contains both `tasks` and `recommendations` |
| `tasks_only` | Contains only `tasks`, swipe disabled |
| `recommendation_only` | Contains only `recommendations` |

* * *

### 13.0.1 Field Definitions

#### Timeline Root Object

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `string` | Yes | Event type: `"complete-timeline"` |
| `data` | `object` | Yes | Timeline data payload |

#### Timeline Data Object

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `timeline_id` | `string (UUID)` | Yes | Unique identifier for the timeline |
| `version` | `integer` | Yes | Timeline version for conflict resolution |
| `style` | `string` | No | Visual style preset: `"default"` |
| `configs` | `object` | Yes | Display configuration |
| `configs.display_price_unit` | `string` | Yes | Currency code: `"INR"`, `"USD"`, etc. |
| `configs.timezone` | `string` | Yes | IANA timezone: `"Asia/Kolkata"` |
| `nodes` | `array` | Yes | Array of timeline nodes |

#### Node Base Object (Common Fields)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Unique node identifier |
| `node_version` | `integer` | Yes | Node version for partial updates |
| `order` | `integer` | Yes | Display order (1-indexed) |
| `type` | `string` | Yes | Node type: `"start"` \| `"end"` \| `"action"` \| `"representation"` \| `"additional_input"` |
| `subtype` | `string \| null` | No | Node subtype (varies by type) |
| `display_date` | `object \| null` | No | Date display configuration |

#### DisplayDate Object

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `string` | Yes | `"date"` \| `"date_range"` \| `"time"` \| `"time_range"` |
| `label` | `string` | Yes | Formatted display label: `"Jan 10, 2026"` |
| `start` | `string (ISO 8601)` | Yes | Start datetime with timezone |
| `end` | `string (ISO 8601)` | No | End datetime (only for range types) |

* * *

#### Task Object (within `action` node)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Unique task identifier |
| `execution_state` | `string` | Yes | `"pending"` \| `"in_progress"` \| `"completed"` \| `"skipped"` |
| `visit_status` | `string \| null` | No | `"confirmed"` \| `"waitinglist"` \| `null` |
| `priority` | `integer` | Yes | Display priority (lower = higher priority) |
| `title` | `string` | Yes | Task title |
| `title_image` | `string (URL)` | No | Optional header image |
| `description` | `string` | No | Task description |
| `price` | `object` | No | Price information |

#### Task Price Object

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `string` | Yes | `"confirmed"` \| `"range"` \| `"constant"` |
| `unit` | `string` | Yes | Currency code |
| `confirmed_price` | `number` | Conditional | Exact price (when `type = "confirmed"`) |
| `price_range` | `object` | Conditional | Price range (when `type = "range"`) |
| `price_range.min` | `number` | Yes | Minimum price |
| `price_range.max` | `number` | Yes | Maximum price |

* * *

#### Recommendation Object (within `action` node)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Unique recommendation identifier |
| `action_state` | `string` | Yes | `"suggested"` \| `"accepted"` \| `"ignored"` |
| `type` | `string` | Yes | Category: `"restaurant"` \| `"place"` \| `"activity"` \| `"hotel"` |
| `priority` | `integer` | Yes | Display priority |
| `title` | `string` | Yes | Recommendation title |
| `title_image` | `string (URL)` | No | Optional header image |
| `description` | `string` | No | Recommendation description |
| `price_included` | `boolean` | Yes | Whether price is included in trip |
| `price_info` | `object` | No | Price information (if `price_included = true`) |
| `price_info.type` | `string` | Yes | `"range"` \| `"confirmed"` \| `"constant"` |
| `price_info.unit` | `string` | Yes | Currency code |
| `price_info.range` | `object` | Conditional | `{ min, max }` for range type |

* * *

#### Representation Object (within `representation` node)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Unique representation identifier |
| `title` | `string` | Yes | Display title |
| `description` | `string` | No | Contextual description |
| `icon` | `string` | No | Icon identifier: `"sun"`, `"rain"`, `"alert"` |
| `image` | `string (URL)` | No | Optional image |

* * *

#### AdditionalInput Object (within `additional_input` node)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Unique input identifier |
| `question` | `string` | Yes | Question prompt for the user |
| `response_type` | `string` | Yes | Expected response: `"text"` \| `"select"` \| `"multiselect"` \| `"date"` |
| `placeholder` | `string` | No | Input placeholder text |
| `is_required` | `boolean` | Yes | Whether response is mandatory |
| `options` | `array` | Conditional | Options for select/multiselect types |

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
    
