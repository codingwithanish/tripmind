// WebSocket Timeline Types based on spec

// ============= Base Types =============

export type NodeType = 'start' | 'end' | 'task_node' | 'representation_node';
export type NodeSubtype = 'default' | 'tasks_only' | 'recommendation_only' | 'additional_input' | null;
export type DateType = 'date' | 'date_range' | 'time' | 'time_range';
export type ExecutionState = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type VisitStatus = 'confirmed' | 'waitinglist' | 'no_action';
export type ActionState = 'suggested' | 'accepted' | 'rejected' | 'converted_to_task';
export type RecommendationType = 'hotel' | 'flight' | 'place' | 'cab' | 'restaurant';
export type PriceType = 'range' | 'constant' | 'confirmed';

// ============= Display Date =============

export interface DisplayDate {
    type: DateType;
    label: string;
    start?: string;
    end?: string;
}

// ============= Price Info =============

export interface PriceRange {
    min: number;
    max: number;
}

export interface PriceInfo {
    type: PriceType;
    unit: string;
    value?: number;
    range?: PriceRange;
    price_range?: PriceRange;
    confirmed_price?: number;
}

// ============= Task Element =============

export interface TaskElement {
    id: string;
    execution_state: ExecutionState;
    visit_status: VisitStatus;
    priority: number;
    title: string;
    title_image?: string;
    description: string;
    price: PriceInfo | null;
}

// ============= Recommendation Element =============

export interface RecommendationElement {
    id: string;
    action_state: ActionState;
    type: RecommendationType;
    priority: number;
    title: string;
    title_image?: string;
    description: string;
    price_included: boolean;
    price_info?: PriceInfo;
}

// ============= Additional Input =============

export interface AdditionalInput {
    id: string;
    question: string;
    response_type: 'text' | 'select' | 'multiselect';
    placeholder?: string;
    options?: string[];
    is_required: boolean;
}

// ============= Representation Element =============

export interface RepresentationElement {
    id: string;
    title: string;
    description: string;
    image?: string;
    icon?: string;
}

// ============= Timeline Node =============

export interface TimelineNode {
    id: string;
    node_version: number;
    order: number;
    type: NodeType;
    subtype: NodeSubtype;
    display_date: DisplayDate | null;
    tasks?: TaskElement[];
    recommendations?: RecommendationElement[];
    representations?: RepresentationElement[];
    additional_input?: AdditionalInput;
}

// ============= Timeline Config =============

export interface TimelineConfig {
    display_price_unit: string;
    timezone: string;
}

// ============= Complete Timeline =============

export interface TimelineData {
    timeline_id: string;
    version: number;
    style: string;
    configs: TimelineConfig;
    nodes: TimelineNode[];
}

// ============= WebSocket Events =============

export interface CompleteTimelineEvent {
    type: 'complete-timeline';
    data: TimelineData;
}

export interface NewNodeEvent {
    type: 'new-node';
    data: {
        timeline_id: string;
        version: number;
        node: TimelineNode & {
            position: {
                after_node_id?: string;
                above_node_id?: string;
            };
        };
    };
}

export interface DeleteNodeEvent {
    type: 'delete-node';
    data: {
        timeline_id: string;
        version: number;
        node_id: string;
    };
}

export interface AddNodeElementEvent {
    type: 'add-node-element';
    data: {
        timeline_id: string;
        version: number;
        node_id: string;
        element_type: 'recommendation' | 'task' | 'additional_input';
        element: TaskElement | RecommendationElement | AdditionalInput;
    };
}

export interface UpdateNodeElementEvent {
    type: 'update-node-element';
    data: {
        timeline_id: string;
        version: number;
        node_id: string;
        element_type: 'task' | 'recommendation';
        element_id: string;
        patch: Partial<TaskElement> | Partial<RecommendationElement>;
    };
}

export interface DeleteNodeElementEvent {
    type: 'delete-node-element';
    data: {
        timeline_id: string;
        version: number;
        node_id: string;
        element_ids: string[];
    };
}

export type TimelineWebSocketEvent =
    | CompleteTimelineEvent
    | NewNodeEvent
    | DeleteNodeEvent
    | AddNodeElementEvent
    | UpdateNodeElementEvent
    | DeleteNodeElementEvent;
