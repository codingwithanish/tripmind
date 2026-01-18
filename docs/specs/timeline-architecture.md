# Timeline Rendering Architecture

This document explains how the Timeline component system works, from data flow to visual rendering.

---

## Overview

The Timeline uses a **compound component pattern** with React Context for shared state. This allows flexible composition while maintaining a clean API.

```
┌─────────────────────────────────────────────────────────────────┐
│  TimelineRenderer (or custom)                                   │
│    ┌───────────────────────────────────────────────────────────┐│
│    │  Timeline.Root (Provider)                                 ││
│    │    ┌─────────────────────────────────────────────────────┐││
│    │    │  Timeline.Spine (SVG vertical line)                 │││
│    │    └─────────────────────────────────────────────────────┘││
│    │    ┌─────────────────────────────────────────────────────┐││
│    │    │  Timeline.Node (for each node)                      │││
│    │    │    ├── Timeline.Marker (circle/icon)                │││
│    │    │    ├── Timeline.DateBadge (date label)              │││
│    │    │    ├── Timeline.Connector (lines to cards)          │││
│    │    │    └── Timeline.Content (card wrapper)              │││
│    │    └─────────────────────────────────────────────────────┘││
│    └───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Input Data (`TimelineData`)
```typescript
interface TimelineData {
    id: string;
    nodes: TimelineNode[];
    version: number;
}

interface TimelineNode {
    id: string;
    type: 'start' | 'end' | 'task_node' | 'representation_node';
    subtype?: 'additional_input' | 'tasks_only' | 'recommendation_only';
    order: number;
    display_date?: { label: string; timestamp?: string };
    tasks?: Task[];
    recommendations?: Recommendation[];
    representations?: Representation[];
    additional_input?: AdditionalInput;
}
```

### 2. Context Provider (`TimelineProvider`)
The provider wraps all timeline components and provides:

| Property | Description |
|---|---|
| `data` | Raw timeline data |
| `visibleNodes` | Filtered nodes (stops at blocking `additional_input`) |
| `style` | Theme configuration from JSON |
| `viewMode` | Current view: `'tasks'` or `'recommendations'` |
| `animationState` | Current animation progress |
| Event handlers | Callbacks for user actions |

### 3. Layout Calculation (`useTimelineLayout`)
Calculates vertical positions using an **influence zone algorithm**:

```
Node 1   ●──[Date]──┬── Card A
         │          └── Card B
         │              ↓ (downward influence)
         │
         │              ↑ (upward influence)
Node 2   ●──[Date]──┬── Card C
                    └── Card D
```

**Algorithm:**
1. For each node, calculate:
   - **Upward influence**: Space cards occupy above center
   - **Downward influence**: Space cards occupy below center
2. Position next node at: `previous.centerY + prev.downward + current.upward + minGap`
3. Distribute cards symmetrically around node center

---

## Component Responsibilities

### `Timeline.Root`
- Sets up `TimelineProvider` with context
- Loads style theme from JSON
- Manages view mode state

### `Timeline.Spine`
- Renders vertical SVG line connecting all nodes
- Animated drawing on mount (D3.js)
- Positioned at `style.spine.x` (default: 40px)

### `Timeline.Node`
- Container positioned absolutely at `position.centerY`
- Provides `NodeProvider` context with node-specific data
- Sets `data-node-id` and `data-node-type` attributes

### `Timeline.Marker`
- Circular or custom shape at node center
- Color based on `node.type`:
  - `start` → green
  - `end` → purple
  - `task_node` → blue
  - `representation_node` → purple
- Pulses for `additional_input` blocking nodes

### `Timeline.DateBadge`
- Blue pill showing `node.display_date.label`
- Positioned after marker: `spineX + nodeSize + dateBadgeDistance`
- Only renders if node has `display_date`

### `Timeline.Connector`
- SVG lines forming tree structure:
  1. Horizontal: Marker → DateBadge
  2. Horizontal: DateBadge → Branch point
  3. Vertical: Connecting multiple cards
  4. Horizontal: Branch → Each card
- Skips date badge lines for nodes without dates

### `Timeline.Content`
- Absolute positioned wrapper at `style.spacing.cardDistance`
- Slide-in animation on mount
- Contains actual card content

---

## Style Configuration

Themes are JSON files in `styles/`:

```json
{
    "spine": {
        "x": 40,
        "strokeWidth": 2,
        "strokeColor": "#e5e7eb"
    },
    "node": {
        "size": { "default": 24, "start": 32 },
        "colors": {
            "start": "#22c55e",
            "task_node": "#3b82f6",
            "representation_node": "#8b5cf6",
            "end": "#8b5cf6"
        }
    },
    "card": {
        "width": 320,
        "height": 120,
        "spacing": 16
    },
    "spacing": {
        "minNodeGap": 30,
        "topOffset": 40,
        "dateBadgeDistance": 20,
        "dateBadgeWidth": 100,
        "cardDistance": 240
    }
}
```

---

## Rendering Flow

```
1. TimelineRenderer receives data
        ↓
2. Sorts nodes by `order`
        ↓
3. Timeline.Root creates provider context
        ↓
4. Timeline.Spine renders animated vertical line
        ↓
5. For each node:
   a. Timeline.Node calculates position via useTimelineLayout
   b. Timeline.Marker renders node circle
   c. Timeline.DateBadge renders date (if present)
   d. Timeline.Connector draws tree lines using D3
   e. Timeline.Content wraps card with animation
   f. DefaultNodeContent renders type-specific card
```

---

## Blocking Nodes

When a node has `subtype: 'additional_input'`:
1. `visibleNodes` stops including nodes after this one
2. Marker pulses to indicate waiting for input
3. Animation pauses
4. After user input, `resumeAnimation()` continues

---

## Usage Example

### Default Renderer
```tsx
<TimelineRenderer
    data={timelineData}
    onTaskComplete={(taskId, nodeId) => /* handle */}
    onAdditionalInput={(nodeId, value) => /* handle */}
/>
```

### Custom Composition
```tsx
<Timeline.Root data={data}>
    <Timeline.Spine />
    {nodes.map(node => (
        <Timeline.Node key={node.id} node={node}>
            <Timeline.Marker />
            <Timeline.DateBadge />
            <Timeline.Connector />
            <Timeline.Content>
                <CustomCard node={node} />
            </Timeline.Content>
        </Timeline.Node>
    ))}
</Timeline.Root>
```

---

## File Structure

```
components/timeline/
├── Timeline.tsx        # Main export + TimelineRenderer
├── TimelineContext.tsx # Context providers & hooks
├── TimelineTypes.ts    # TypeScript interfaces
├── Timeline.css        # Global timeline styles
├── index.ts            # Public exports
├── components/
│   ├── Spine.tsx       # Vertical line (D3)
│   ├── Node.tsx        # Node container
│   ├── Marker.tsx      # Node circle (D3)
│   ├── Connector.tsx   # Tree lines (D3)
│   ├── Content.tsx     # Card wrapper
│   ├── DateBadge.tsx   # Date label
│   └── slots/          # Type-specific slot components
├── hooks/
│   ├── useTimelineLayout.ts   # Layout algorithm
│   └── useTimelineAnimation.ts # Animation sequencing
└── styles/
    ├── default.json    # Default theme
    └── index.ts        # Style loader
```
