// Timeline Type Definitions for V2
// Re-exports types from websocket.types and adds UI-specific types

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

// ============= UI Types =============

export type Severity = 'low' | 'medium' | 'high';

export type NodeVariant = 'action' | 'representation' | 'start' | 'end';

// ============= Component Props =============

export interface TimelineRendererProps {
    data: TimelineData | null;
    className?: string;
    onTaskComplete?: (taskId: string, nodeId: string) => void;
    onTaskSkip?: (taskId: string, nodeId: string) => void;
    onRecommendationAccept?: (recId: string, nodeId: string) => void;
    onRecommendationIgnore?: (recId: string, nodeId: string) => void;
    onAdditionalInput?: (nodeId: string, value: string) => void;
    onHelpRequest?: (nodeId: string) => void;
}

export interface ActionCardProps {
    node: TimelineNode;
    onFlip?: (isFlipped: boolean) => void;
    onHelpRequest?: (nodeId: string) => void;
}

export interface RepresentationCardProps {
    node: TimelineNode;
    severity?: Severity;
}

export interface TaskItemProps {
    id: string;
    icon?: string;
    title: string;
    subtitle?: string;
    priceLabel?: string;
    priceValue?: string;
    priceUnit?: string;
    priceStatus?: 'confirmed' | 'not-confirmed';
}

export interface NodeCircleProps {
    variant: NodeVariant;
    severity?: Severity;
    icon?: string;
    style?: React.CSSProperties;
}

export interface ConnectorProps {
    variant: NodeVariant;
    severity?: Severity;
    style?: React.CSSProperties;
}

// ============= Config =============

export const TimelineConfig = {
    spacing: {
        nodeBuffer: 40,
        headerHeight: 76,
        taskItemHeight: 95,
        footerHeight: 120,
        representationHeight: 90,
        circleOffset: 18,
        circleSize: 36,
        lineHeight: 3,
    },
    autoFlipDelay: 10000,
    defaultIcons: {
        action: 'mdi:airplane',
        representation: 'mdi:alert-circle',
        back: 'mdi:chevron-left',
        start: 'mdi:flag-checkered',
        end: 'mdi:flag',
    },
} as const;

// ============= Utility Functions =============

/**
 * Determine severity from representations or default to 'low'
 */
export function getSeverityFromNode(node: TimelineNode): Severity {
    // Check if there's a severity hint in the representation description
    const rep = node.representations?.[0];
    if (!rep) return 'low';

    const desc = rep.description?.toLowerCase() || '';
    const title = rep.title?.toLowerCase() || '';
    const text = desc + ' ' + title;

    if (text.includes('urgent') || text.includes('important') || text.includes('immediately') || text.includes('required')) {
        return 'high';
    }
    if (text.includes('warning') || text.includes('caution') || text.includes('expected') || text.includes('consider')) {
        return 'medium';
    }
    return 'low';
}

/**
 * Map icon name to iconify format if needed
 */
export function mapIcon(icon?: string): string {
    if (!icon) return 'mdi:checkbox-marked-circle';
    // If already in iconify format, return as-is
    if (icon.includes(':')) return icon;
    // Map common icon names to iconify
    const iconMap: Record<string, string> = {
        'sun': 'mdi:weather-sunny',
        'airplane': 'mdi:airplane',
        'hotel': 'mdi:bed',
        'car': 'mdi:car',
        'food': 'mdi:food',
        'camera': 'mdi:camera',
        'alert': 'mdi:alert',
    };
    return iconMap[icon] || `mdi:${icon}`;
}
