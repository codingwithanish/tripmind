// Timeline Context - Shared state for compound components

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { TimelineData, TimelineNode, LayoutResult, ViewMode, TimelineAnimationState } from './TimelineTypes';
import type { TimelineStyle } from './styles';
import { getDefaultStyle, loadStyle } from './styles';

// ============= Context Value Type =============

interface TimelineContextValue {
    // Data
    data: TimelineData | null;
    visibleNodes: TimelineNode[];

    // Style
    style: TimelineStyle;
    styleName: string;

    // Layout
    layout: LayoutResult | null;

    // View mode (tasks vs recommendations)
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    canSwipe: (node: TimelineNode) => boolean;

    // Animation state
    animationState: TimelineAnimationState;
    isPaused: boolean;
    resumeAnimation: () => void;

    // Event handlers
    onTaskComplete?: (taskId: string, nodeId: string) => void;
    onTaskSkip?: (taskId: string, nodeId: string) => void;
    onRecommendationAccept?: (recId: string, nodeId: string) => void;
    onRecommendationIgnore?: (recId: string, nodeId: string) => void;
    onAdditionalInput?: (nodeId: string, value: string) => void;
}

// ============= Node Context (for nested Node components) =============

interface NodeContextValue {
    node: TimelineNode;
    nodeIndex: number;
    isAnimating: boolean;
    isBlocking: boolean;
}

// ============= Create Contexts =============

const TimelineContext = createContext<TimelineContextValue | null>(null);
const NodeContext = createContext<NodeContextValue | null>(null);

// ============= Provider Props =============

interface TimelineProviderProps {
    data: TimelineData | null;
    styleName?: string;
    children: React.ReactNode;
    onTaskComplete?: (taskId: string, nodeId: string) => void;
    onTaskSkip?: (taskId: string, nodeId: string) => void;
    onRecommendationAccept?: (recId: string, nodeId: string) => void;
    onRecommendationIgnore?: (recId: string, nodeId: string) => void;
    onAdditionalInput?: (nodeId: string, value: string) => void;
}

// ============= Timeline Provider =============

export function TimelineProvider({
    data,
    styleName = 'default',
    children,
    onTaskComplete,
    onTaskSkip,
    onRecommendationAccept,
    onRecommendationIgnore,
    onAdditionalInput,
}: TimelineProviderProps) {
    // Style loading
    const [style, setStyle] = useState<TimelineStyle>(getDefaultStyle());

    useEffect(() => {
        loadStyle(styleName).then(setStyle);
    }, [styleName]);

    // View mode state
    const [viewMode, setViewMode] = useState<ViewMode>('tasks');

    // Animation state
    const [animationState, setAnimationState] = useState<TimelineAnimationState>({
        currentNodeIndex: 0,
        nodes: new Map(),
        isPaused: false,
        isComplete: false,
    });

    // Filter visible nodes (stop at additional_input blocking node)
    const visibleNodes = useMemo(() => {
        if (!data) return [];
        const sorted = [...data.nodes].sort((a, b) => a.order - b.order);

        const result: TimelineNode[] = [];
        for (const node of sorted) {
            result.push(node);
            // Stop after additional_input node (blocking behavior)
            // Note: additional_input is a subtype, not a type
            if (node.subtype === 'additional_input') {
                break;
            }
        }
        return result;
    }, [data]);

    // Check if swipe is allowed for a node
    const canSwipe = useCallback((node: TimelineNode): boolean => {
        if (node.type !== 'task_node') return false;
        if (node.subtype === 'tasks_only') return false;
        if (node.subtype === 'recommendation_only') return false;
        if (node.subtype === 'additional_input') return false;
        if (!node.recommendations || node.recommendations.length === 0) return false;
        return true;
    }, []);

    // Resume animation after blocking node
    const resumeAnimation = useCallback(() => {
        setAnimationState(prev => ({
            ...prev,
            isPaused: false,
        }));
    }, []);

    // Check if currently paused
    const isPaused = animationState.isPaused;

    // Layout is computed in useTimelineLayout hook
    // For now, set to null - will be populated by the hook
    const layout: LayoutResult | null = null;

    const contextValue: TimelineContextValue = {
        data,
        visibleNodes,
        style,
        styleName,
        layout,
        viewMode,
        setViewMode,
        canSwipe,
        animationState,
        isPaused,
        resumeAnimation,
        onTaskComplete,
        onTaskSkip,
        onRecommendationAccept,
        onRecommendationIgnore,
        onAdditionalInput,
    };

    return (
        <TimelineContext.Provider value={contextValue}>
            {children}
        </TimelineContext.Provider>
    );
}

// ============= Node Provider =============

interface NodeProviderProps {
    node: TimelineNode;
    nodeIndex: number;
    children: React.ReactNode;
}

export function NodeProvider({ node, nodeIndex, children }: NodeProviderProps) {
    const timeline = useTimeline();

    const isAnimating = timeline.animationState.currentNodeIndex === nodeIndex;
    // Note: additional_input is a subtype, not a type
    const isBlocking = node.subtype === 'additional_input';

    const nodeValue: NodeContextValue = {
        node,
        nodeIndex,
        isAnimating,
        isBlocking,
    };

    return (
        <NodeContext.Provider value={nodeValue}>
            {children}
        </NodeContext.Provider>
    );
}

// ============= Hooks =============

export function useTimeline(): TimelineContextValue {
    const context = useContext(TimelineContext);
    if (!context) {
        throw new Error('useTimeline must be used within a TimelineProvider');
    }
    return context;
}

export function useNode(): NodeContextValue {
    const context = useContext(NodeContext);
    if (!context) {
        throw new Error('useNode must be used within a NodeProvider');
    }
    return context;
}

export function useOptionalNode(): NodeContextValue | null {
    return useContext(NodeContext);
}
