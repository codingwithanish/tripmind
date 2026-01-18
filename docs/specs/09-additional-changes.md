# Timeline UX & Data Model – Change Specification (Addendum)

## 1. Overview of Changes

This document defines the following new requirements and corrections to the Timeline system:

1. Representation nodes must be rendered **inside a node’s content**, not as standalone nodes.
    
2. Explicit **arrows must be rendered from timeline nodes to their elements** (tasks, recommendations, representations).
    
3. The **timeline spine must dynamically expand** based on the number of elements.
    
4. Timeline rendering must follow a **strict top-to-bottom flow** for both nodes and elements.
    
5. `additional_input` nodes must **pause rendering of all subsequent nodes** until input is completed.
    
6. Timeline must support **horizontal dragging (left ↔ right)** to switch between tasks and recommendations.
    
7. Data structure and rendering must match the **attached wireframe**, including arrow placement and grouping.
    

* * *

## 2. Representation Node – Structural Change

### 2.1 Previous Behavior (Deprecated)

* `representation_node` existed as an independent node type on the timeline spine.
    
* Context (e.g., weather) appeared as a separate node.
    

### 2.2 New Behavior (Required)

* **Representation content is no longer a standalone node**
    
* Representation elements must be rendered **inside a `task_node`**
    
* Representation becomes a **node element**, similar to tasks and recommendations
    

### 2.3 Updated Conceptual Model

```text
Task Node
 ├─ Task elements
 ├─ Recommendation elements
 └─ Representation elements (weather, alerts, context)
```

### 2.4 UX Impact

* Weather or contextual information appears **within the same visual grouping**
    
* Eliminates visual breaks in the timeline
    
* Makes context feel directly related to actions
    

### 2.5 Recommended Data Change

```json
{
  "element_type": "representation",
  "representation": {
    "image": "weather.png",
    "description": "Light rain expected"
  }
}
```

> `representation_node` as a top-level node type should be deprecated.

* * *

## 3. Arrow Rendering (Node → Element)

### 3.1 Requirement

* Every element (task, recommendation, representation) must be visually connected to its parent node using an **arrow**
    
* Arrows must originate from the **node spine marker**
    
* Arrows must terminate at the **element card**
    

### 3.2 Arrow Characteristics

* Direction: from spine → element
    
* Style:
    
    * Solid line
        
    * Arrowhead pointing to element
        
* Color:
    
    * Inherits from active side (task side or recommendation side)
        

### 3.3 UX Purpose

* Makes hierarchy explicit
    
* Improves readability for dense timelines
    
* Matches attached wireframe
    

* * *

## 4. Timeline Spine Expansion

### 4.1 Problem (Current)

* Spine height is fixed
    
* Does not expand when multiple elements exist for a node
    

### 4.2 Required Behavior

* Timeline spine must **expand vertically** to accommodate:
    
    * Multiple tasks
        
    * Multiple recommendations
        
    * Representation elements
        
* Spine height for a node = height of tallest element stack
    

### 4.3 Rendering Rule

```text
Node height = max(
  task stack height,
  recommendation stack height
)
```

### 4.4 UX Impact

* No element overlap
    
* Clear vertical rhythm
    
* Proper arrow alignment
    

* * *

## 5. Top-to-Bottom Rendering Order

### 5.1 Node Order

* Nodes must render **strictly top to bottom** based on `order`
    
* No floating or side-by-side node rendering
    

### 5.2 Element Order Inside a Node

Elements inside a node must render top to bottom based on:

1. Priority
    
2. Element type grouping (recommended):
    
    * Representation
        
    * Tasks
        
    * Recommendations
        

### 5.3 Visual Hierarchy

```text
[ Date Label ]
    |
[ Node Marker ]
    |
→ Element 1
→ Element 2
→ Element 3
```

* * *

## 6. `additional_input` Node – Blocking Behavior

### 6.1 Required Change

When a node has subtype `additional_input`:

* Timeline rendering must **pause at this node**
    
* All nodes after this must:
    
    * Not be rendered
        
    * Not occupy space
        
    * Not animate in
        

### 6.2 UX Behavior

* The `additional_input` node:
    
    * Is fully visible
        
    * Shows its input UI
        
* Chat auto-focuses on the related question
    
* Swipe and drag gestures are disabled beyond this node
    

### 6.3 Resume Rule

* Once input is submitted:
    
    * Backend sends updated timeline via WebSocket
        
    * Rendering resumes from the next node
        

* * *

## 7. Horizontal Drag / Swipe Behavior (Confirmed & Clarified)

### 7.1 Supported Gestures

* Drag or swipe **left ↔ right** on:
    
    * Task node
        
    * Recommendation node
        

### 7.2 Gesture Result

| Gesture | Result |
| --- | --- |
| Left → Right | Show recommendations |
| Right → Left | Show tasks |

### 7.3 Constraints

* Only one side visible at a time
    
* Representation elements are shown **on both sides** (since they are contextual)
    
* Swipe disabled for:
    
    * `additional_input` nodes
        
    * Nodes with `tasks_only` or `recommendation_only`
        

* * *

## 8. Data Structure Alignment with Wireframe

### 8.1 Conceptual Structure (Final)

```json
{
  "node": {
    "id": "...",
    "type": "task_node",
    "elements": {
      "representations": [],
      "tasks": [],
      "recommendations": []
    }
  }
}
```

### 8.2 Arrow Mapping

* Each element implicitly maps to:
    

```text
(node_id) → (element_id)
```

Frontend uses this mapping to render arrows.

* * *

## 9. D3 Rendering Rules (High-Level)

* Spine is a dynamic vertical line
    
* Node markers placed sequentially
    
* Elements positioned with:
    
    * Vertical stacking
        
    * Horizontal offset (task vs recommendation side)
        
* Arrows drawn after layout calculation
    
* Layout recalculated on:
    
    * WebSocket updates
        
    * Swipe interactions
        
    * Window resize
        

* * *

## 10. Summary of Changes

| Area | Change |
| --- | --- |
| Representation nodes | Moved inside task nodes |
| Arrows | Mandatory node → element arrows |
| Spine | Dynamically expanding |
| Rendering | Strict top-to-bottom |
| Additional input | Blocking timeline progression |
| Gestures | Drag left/right supported |
| Data model | Element-centric grouping |

* * *

## 11. Outcome

With these changes:

* Timeline becomes **clearer and denser**
    
* Visual hierarchy matches mental model
    
* Context (weather, alerts) feels actionable
    
* Complex plans remain readable
    
* Wireframe intent is fully honored
    
