import React, { useMemo } from 'react';
import { TimelineData } from '../../../types/websocket.types';
import TimelineNode from '../TimelineNodeNew';
import './TimelineContainer.css';

export interface TimelineContainerProps {
    timeline: TimelineData | null;
    isLoading?: boolean;
    onTaskComplete?: (taskId: string, nodeId: string) => void;
    onTaskSkip?: (taskId: string, nodeId: string) => void;
    onAdditionalInput?: (nodeId: string, value: string) => void;
}

const TimelineContainer: React.FC<TimelineContainerProps> = ({
    timeline,
    isLoading = false,
    onTaskComplete,
    onTaskSkip,
    onAdditionalInput,
}) => {
    // Filter nodes: stop rendering after additional_input node (blocking behavior)
    const visibleNodes = useMemo(() => {
        if (!timeline) return [];
        const sorted = [...timeline.nodes].sort((a, b) => a.order - b.order);

        const result = [];
        for (const node of sorted) {
            result.push(node);
            // Stop after additional_input node
            if (node.subtype === 'additional_input') {
                break;
            }
        }
        return result;
    }, [timeline]);

    if (isLoading || !timeline) {
        return (
            <div className="timeline-container timeline-container--loading">
                <div className="timeline-container__loader">
                    <div className="timeline-container__spinner"></div>
                    <p>Loading your timeline...</p>
                </div>
            </div>
        );
    }

    if (visibleNodes.length === 0) {
        return (
            <div className="timeline-container timeline-container--empty">
                <div className="timeline-container__empty">
                    <span className="timeline-container__empty-icon">📅</span>
                    <h3>No timeline data</h3>
                    <p>Your travel timeline will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="timeline-container">
            <div className="timeline-container__nodes">
                {visibleNodes.map((node, index) => (
                    <TimelineNode
                        key={node.id}
                        node={node}
                        isLast={index === visibleNodes.length - 1}
                        onTaskComplete={(taskId) => onTaskComplete?.(taskId, node.id)}
                        onTaskSkip={(taskId) => onTaskSkip?.(taskId, node.id)}
                        onAdditionalInput={(value) => onAdditionalInput?.(node.id, value)}
                    />
                ))}
            </div>
        </div>
    );
};

export default TimelineContainer;
