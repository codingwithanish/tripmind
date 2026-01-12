# Timeline WebSocket API – Response Documentation

## 1. Overview

The Timeline WebSocket API provides **real-time, incremental updates** to the travel timeline.  
All timeline rendering and updates on the frontend are **entirely driven by WebSocket events**.

### Key Characteristics

* Event-driven (not request/response)
    
* Versioned for safety
    
* Incremental mutations supported
    
* Designed for AI-driven, evolving timelines
    

* * *

## 2. Connection Lifecycle

### 2.1 When WebSocket is Opened

* Opened when the user enters the **Timeline Page**
    
* One active WebSocket connection per timeline
    

### 2.2 Initial Payload

* Backend MUST send `complete-timeline` as the **first event**
    
* This event is the **single source of truth**
    

* * *

## 3. Common Response Envelope

Every WebSocket message follows this structure:

```json
{
  "type": "<event_type>",
  "data": { }
}
```

### Common Rules

* `type` determines how the frontend processes the message
    
* `data` contains the payload specific to the event
    
* All messages must include a valid `timeline_id`
    

* * *

## 4. Timeline Versioning Rules (Critical)

### Timeline-Level Versioning

```json
"version": 12
```

* Increments with every timeline mutation
    
* Frontend MUST:
    
    * Ignore messages with a lower version
        
    * Apply only newer versions
        

### Node-Level Versioning

```json
"node_version": 3
```

* Used to prevent stale node updates
    
* Frontend MUST validate node versions before applying patches
    

* * *

## 5. Event Types

* * *

## 5.1 `complete-timeline`

### Purpose

* Sends the **entire timeline snapshot**
    
* Used for:
    
    * Initial load
        
    * Hard refresh
        
    * Recovery after disconnect
        

### Behavior

* Frontend clears existing timeline state
    
* Rebuilds timeline from scratch
    

### Payload Structure

```json
{
  "type": "complete-timeline",
  "data": {
    "timeline_id": "uuid",
    "version": 1,
    "style": "default",
    "configs": {
      "display_price_unit": "INR",
      "timezone": "Asia/Kolkata"
    },
    "nodes": [ /* node objects */ ]
  }
}
```

* * *

## 6. Node Object Definition

### Common Node Fields

```json
{
  "id": "uuid",
  "node_version": 1,
  "order": 2,
  "type": "task_node",
  "subtype": "default",
  "display_date": { }
}
```

### Node Types

| Type | Description |
| --- | --- |
| `start` | Timeline entry point |
| `end` | Timeline end |
| `task_node` | Actionable planning step |
| `representation_node` | Visual/context-only node |

* * *

## 7. `display_date` Object

Supports multiple time representations:

```json
"display_date": {
  "type": "date | date_range | time | time_range",
  "label": "Jan 10 – Jan 15",
  "start": "2026-01-10T00:00:00Z",
  "end": "2026-01-15T23:59:59Z"
}
```

Frontend renders label based on `type`.

* * *

## 8. Recommendations Object

```json
{
  "id": "uuid",
  "action_state": "suggested | accepted | rejected | converted_to_task",
  "type": "hotel | flight | place | cab | restaurant",
  "priority": 1,
  "title_image": "image_url",
  "description": "string",
  "price_included": true,
  "price_info": {
    "type": "range | constant",
    "unit": "INR",
    "range": { "min": 5000, "max": 8000 }
  }
}
```

### Key Notes

* `priority` determines ordering
    
* `action_state` controls UI transitions
    
* Conversion to task happens via update events
    

* * *

## 9. Task Object

```json
{
  "id": "uuid",
  "execution_state": "pending | in_progress | completed | skipped",
  "visit_status": "confirmed | waitinglist | no_action",
  "priority": 1,
  "title_image": "image_url",
  "description": "string",
  "price": {
    "type": "range | constant | confirmed",
    "unit": "INR",
    "price_range": { "min": 12000, "max": 18000 },
    "confirmed_price": 15000
  }
}
```

* * *

## 10. `new-node`

### Purpose

* Inserts a new node into the timeline
    

```json
{
  "type": "new-node",
  "data": {
    "timeline_id": "uuid",
    "version": 2,
    "node": {
      "id": "uuid",
      "node_version": 1,
      "type": "task_node",
      "subtype": "default",
      "display_date": { },
      "position": {
        "after_node_id": "uuid"
      }
    }
  }
}
```

* * *

## 11. `delete-node`

### Purpose

* Removes an entire node
    

```json
{
  "type": "delete-node",
  "data": {
    "timeline_id": "uuid",
    "version": 3,
    "node_id": "uuid"
  }
}
```

* * *

## 12. `add-node-element`

### Purpose

* Adds a recommendation, task, or input to an existing node
    

```json
{
  "type": "add-node-element",
  "data": {
    "timeline_id": "uuid",
    "version": 4,
    "node_id": "uuid",
    "element_type": "recommendation | task | additional_input",
    "element": { }
  }
}
```

* * *

## 13. `update-node-element` (Recommended)

### Purpose

* Partially updates an element
    

```json
{
  "type": "update-node-element",
  "data": {
    "timeline_id": "uuid",
    "version": 5,
    "node_id": "uuid",
    "element_type": "task | recommendation",
    "element_id": "uuid",
    "patch": {
      "execution_state": "completed"
    }
  }
}
```

* * *

## 14. `delete-node-element`

### Purpose

* Removes one or more elements
    

```json
{
  "type": "delete-node-element",
  "data": {
    "timeline_id": "uuid",
    "version": 6,
    "node_id": "uuid",
    "element_ids": ["uuid1", "uuid2"]
  }
}
```

* * *

## 15. Frontend Processing Rules (Mandatory)

* Ignore stale versions
    
* Apply updates atomically
    
* Animate inserts/removals
    
* Never mutate start/end node positions manually
    

* * *

## 16. Error & Recovery Handling

| Scenario | Behavior |
| --- | --- |
| WebSocket disconnect | Freeze UI + retry |
| Reconnect | Request new `complete-timeline` |
| Invalid node update | Ignore safely |

* * *

## 17. Design Principles

* Timeline is **event-sourced**
    
* Backend owns timeline truth
    
* Frontend is deterministic renderer
    
* UX reflects intent, not raw data
    

* * *

## 18. Summary

This WebSocket contract enables:

* Real-time AI planning
    
* Safe incremental updates
    
* Rich D3 timeline rendering
    
* Mobile gestures & desktop workflows
    
* Long-term extensibility
    