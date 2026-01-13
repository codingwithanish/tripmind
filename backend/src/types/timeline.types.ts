// Timeline WebSocket Response Types

// ============================================================================
// Root Types
// ============================================================================

export interface TimelineWebSocketMessage {
    type: 'complete-timeline' | 'new-node' | 'delete-node' | 'add-node-element' | 'update-node-element' | 'delete-node-element';
    data: TimelineData;
}

export interface TimelineData {
    timeline_id: string;
    version: number;
    style: string;
    configs: TimelineConfigs;
    nodes: TimelineNode[];
}

export interface TimelineConfigs {
    display_price_unit: string;
    timezone: string;
}

// ============================================================================
// Node Types
// ============================================================================

export type TimelineNode = StartNode | EndNode | ActionNode | RepresentationNode | AdditionalInputNode;

export type NodeType = 'start' | 'end' | 'action' | 'representation' | 'additional_input';

export interface BaseNode {
    id: string;
    node_version: number;
    order: number;
    type: NodeType;
    subtype: string | null;
    display_date: DisplayDate | null;
}

export interface StartNode extends BaseNode {
    type: 'start';
}

export interface EndNode extends BaseNode {
    type: 'end';
}

export interface ActionNode extends BaseNode {
    type: 'action';
    subtype: 'default' | 'tasks_only' | 'recommendation_only' | null;
    tasks?: Task[];
    recommendations?: Recommendation[];
}

export interface RepresentationNode extends BaseNode {
    type: 'representation';
    subtype: 'weather' | 'alert' | 'location' | string | null;
    representation: Representation;
}

export interface AdditionalInputNode extends BaseNode {
    type: 'additional_input';
    additional_input: AdditionalInput;
}

// ============================================================================
// Display Date Types
// ============================================================================

export type DisplayDateType = 'date' | 'date_range' | 'time' | 'time_range';

export interface DisplayDate {
    type: DisplayDateType;
    label: string;
    start: string; // ISO 8601 datetime
    end?: string;  // ISO 8601 datetime (for range types)
}

// ============================================================================
// Task Types
// ============================================================================

export type ExecutionState = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type VisitStatus = 'confirmed' | 'waitinglist' | null;

export interface Task {
    id: string;
    execution_state: ExecutionState;
    visit_status: VisitStatus;
    priority: number;
    title: string;
    title_image?: string;
    description?: string;
    price?: TaskPrice | null;
}

export type PriceType = 'confirmed' | 'range' | 'constant';

export interface TaskPrice {
    type: PriceType;
    unit: string;
    confirmed_price?: number;        // when type = 'confirmed'
    price_range?: PriceRange;        // when type = 'range'
    value?: number;                  // when type = 'constant'
}

export interface PriceRange {
    min: number;
    max: number;
}

// ============================================================================
// Recommendation Types
// ============================================================================

export type ActionState = 'suggested' | 'accepted' | 'ignored';
export type RecommendationType = 'restaurant' | 'place' | 'activity' | 'hotel' | 'flight' | string;

export interface Recommendation {
    id: string;
    action_state: ActionState;
    type: RecommendationType;
    priority: number;
    title: string;
    title_image?: string;
    description?: string;
    price_included: boolean;
    price_info?: RecommendationPriceInfo;
}

export interface RecommendationPriceInfo {
    type: PriceType;
    unit: string;
    value?: number;                  // when type = 'constant'
    range?: PriceRange;              // when type = 'range'
    confirmed_price?: number;        // when type = 'confirmed'
}

// ============================================================================
// Representation Types
// ============================================================================

export interface Representation {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    image?: string;
}

// ============================================================================
// Additional Input Types
// ============================================================================

export type ResponseType = 'text' | 'select' | 'multiselect' | 'date';

export interface AdditionalInput {
    id: string;
    question: string;
    response_type: ResponseType;
    placeholder?: string;
    is_required: boolean;
    options?: AdditionalInputOption[];
}

export interface AdditionalInputOption {
    id: string;
    label: string;
    value: string;
}
