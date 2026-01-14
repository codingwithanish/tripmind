// Timeline Type Definitions
// Re-exports types from websocket.types and adds Timeline-specific types

import type {
    TimelineData,
    TimelineNode,
    TaskElement,
    RecommendationElement,
    RepresentationElement,
    AdditionalInput,
    DisplayDate,
} from '../../types/websocket.types';

// Re-export for convenience
export type {
    TimelineData,
    TimelineNode,
    TaskElement,
    RecommendationElement,
    RepresentationElement,
    AdditionalInput,
    DisplayDate,
};

// ============= Layout Types =============

export interface CardPosition {
    id: string;
    type: 'task' | 'recommendation' | 'representation' | 'additional_input';
    y: number; // Vertical position relative to node center
    height: number;
}

export interface NodePosition {
    nodeId: string;
    centerY: number; // Center of the node on the spine
    dateCardY: number; // Y position of date card
    cards: CardPosition[];
    totalHeight: number; // Total vertical space this node occupies
}

export interface LayoutResult {
    positions: NodePosition[];
    totalHeight: number;
    spineStart: number;
    spineEnd: number;
}

// ============= Animation Types =============

export type AnimationPhase = 'idle' | 'entering' | 'active' | 'exiting';

export interface NodeAnimationState {
    nodeId: string;
    phase: AnimationPhase;
    progress: number; // 0-1
    isBlocking: boolean;
}

export interface TimelineAnimationState {
    currentNodeIndex: number;
    nodes: Map<string, NodeAnimationState>;
    isPaused: boolean;
    isComplete: boolean;
}

// ============= Component Props Types =============

export interface TimelineRootProps {
    data: TimelineData | null;
    style?: string;
    className?: string;
    children?: React.ReactNode;
    onTaskComplete?: (taskId: string, nodeId: string) => void;
    onTaskSkip?: (taskId: string, nodeId: string) => void;
    onRecommendationAccept?: (recId: string, nodeId: string) => void;
    onRecommendationIgnore?: (recId: string, nodeId: string) => void;
    onAdditionalInput?: (nodeId: string, value: string) => void;
}

export interface TimelineNodeProps {
    node: TimelineNode;
    children?: React.ReactNode;
}

export interface TimelineMarkerProps {
    className?: string;
}

export interface TimelineConnectorProps {
    className?: string;
    targetIndex?: number; // Which card to connect to (if multiple)
}

export interface TimelineContentProps {
    children?: React.ReactNode;
    className?: string;
}

// ============= Node Type Slot Props =============

export interface SlotProps {
    children?: React.ReactNode;
}

// ============= View Mode =============

export type ViewMode = 'tasks' | 'recommendations';
