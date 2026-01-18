// useTimelineAnimation - Animation orchestration hook
// Handles sequential loading with staggered effects

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimelineNode, TimelineAnimationState, NodeAnimationState } from '../TimelineTypes';
import type { TimelineStyle } from '../styles';

interface UseTimelineAnimationProps {
    nodes: TimelineNode[];
    style: TimelineStyle;
    enabled?: boolean;
}

interface UseTimelineAnimationResult {
    animationState: TimelineAnimationState;
    getNodeAnimationState: (nodeId: string) => NodeAnimationState | undefined;
    isNodeVisible: (nodeId: string) => boolean;
    isNodeAnimating: (nodeId: string) => boolean;
    isPaused: boolean;
    resume: () => void;
    reset: () => void;
}

/**
 * Check if a node is a blocking node (additional_input)
 */
function isBlockingNode(node: TimelineNode): boolean {
    // additional_input is a subtype, not a type
    return node.subtype === 'additional_input';
}

/**
 * Animation orchestration hook
 * Animates nodes sequentially with staggered card animations
 */
export function useTimelineAnimation({
    nodes,
    style,
    enabled = true,
}: UseTimelineAnimationProps): UseTimelineAnimationResult {
    const [animationState, setAnimationState] = useState<TimelineAnimationState>({
        currentNodeIndex: -1,
        nodes: new Map(),
        isPaused: false,
        isComplete: false,
    });

    const animationRef = useRef<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize animation when nodes change
    useEffect(() => {
        if (!enabled || nodes.length === 0) {
            setAnimationState({
                currentNodeIndex: -1,
                nodes: new Map(),
                isPaused: false,
                isComplete: true,
            });
            return;
        }

        // Reset and start animation
        const initialNodes = new Map<string, NodeAnimationState>();
        nodes.forEach(node => {
            initialNodes.set(node.id, {
                nodeId: node.id,
                phase: 'idle',
                progress: 0,
                isBlocking: isBlockingNode(node),
            });
        });

        setAnimationState({
            currentNodeIndex: 0,
            nodes: initialNodes,
            isPaused: false,
            isComplete: false,
        });
    }, [nodes, enabled]);

    // Animation loop
    useEffect(() => {
        if (!enabled || animationState.isComplete || animationState.isPaused) {
            return;
        }

        const { currentNodeIndex } = animationState;
        if (currentNodeIndex < 0 || currentNodeIndex >= nodes.length) {
            return;
        }

        const currentNode = nodes[currentNodeIndex];
        const nodeState = animationState.nodes.get(currentNode.id);

        if (!nodeState) return;

        // Start entering phase
        if (nodeState.phase === 'idle') {
            setAnimationState(prev => {
                const newNodes = new Map(prev.nodes);
                newNodes.set(currentNode.id, {
                    ...nodeState,
                    phase: 'entering',
                    progress: 0,
                });
                return { ...prev, nodes: newNodes };
            });
            return;
        }

        // Animate entering phase
        if (nodeState.phase === 'entering') {
            const duration = style.animation.duration;

            // Use RAF for smooth animation
            let startTime: number | null = null;

            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);

                setAnimationState(prev => {
                    const newNodes = new Map(prev.nodes);
                    newNodes.set(currentNode.id, {
                        ...nodeState,
                        phase: progress >= 1 ? 'active' : 'entering',
                        progress,
                    });
                    return { ...prev, nodes: newNodes };
                });

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                }
            };

            animationRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        }

        // Node is active, check if we should proceed to next
        if (nodeState.phase === 'active') {
            // If blocking node, pause the animation
            if (nodeState.isBlocking) {
                setAnimationState(prev => ({ ...prev, isPaused: true }));
                return;
            }

            // Move to next node after delay
            timeoutRef.current = setTimeout(() => {
                const nextIndex = currentNodeIndex + 1;

                if (nextIndex >= nodes.length) {
                    setAnimationState(prev => ({
                        ...prev,
                        isComplete: true,
                    }));
                } else {
                    setAnimationState(prev => ({
                        ...prev,
                        currentNodeIndex: nextIndex,
                    }));
                }
            }, style.animation.nodeDelay);

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }
    }, [animationState, nodes, style, enabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Get animation state for a specific node
    const getNodeAnimationState = useCallback(
        (nodeId: string): NodeAnimationState | undefined => {
            return animationState.nodes.get(nodeId);
        },
        [animationState.nodes]
    );

    // Check if a node is visible (has been animated)
    const isNodeVisible = useCallback(
        (nodeId: string): boolean => {
            const nodeState = animationState.nodes.get(nodeId);
            if (!nodeState) return false;
            return nodeState.phase !== 'idle';
        },
        [animationState.nodes]
    );

    // Check if a node is currently animating
    const isNodeAnimating = useCallback(
        (nodeId: string): boolean => {
            const nodeState = animationState.nodes.get(nodeId);
            if (!nodeState) return false;
            return nodeState.phase === 'entering';
        },
        [animationState.nodes]
    );

    // Resume animation (after blocking node input)
    const resume = useCallback(() => {
        setAnimationState(prev => {
            const nextIndex = prev.currentNodeIndex + 1;
            if (nextIndex >= nodes.length) {
                return { ...prev, isPaused: false, isComplete: true };
            }
            return {
                ...prev,
                isPaused: false,
                currentNodeIndex: nextIndex,
            };
        });
    }, [nodes.length]);

    // Reset animation
    const reset = useCallback(() => {
        const initialNodes = new Map<string, NodeAnimationState>();
        nodes.forEach(node => {
            initialNodes.set(node.id, {
                nodeId: node.id,
                phase: 'idle',
                progress: 0,
                isBlocking: isBlockingNode(node),
            });
        });

        setAnimationState({
            currentNodeIndex: 0,
            nodes: initialNodes,
            isPaused: false,
            isComplete: false,
        });
    }, [nodes]);

    return {
        animationState,
        getNodeAnimationState,
        isNodeVisible,
        isNodeAnimating,
        isPaused: animationState.isPaused,
        resume,
        reset,
    };
}
