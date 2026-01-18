// Node Component - Container for each timeline node
// Handles positioning and provides node context to children

import React from 'react';
import { NodeProvider, useTimeline } from '../TimelineContext';
import type { TimelineNode } from '../TimelineTypes';
import { useTimelineLayout } from '../hooks';

interface NodeProps {
    node: TimelineNode;
    children?: React.ReactNode;
    className?: string;
}

export function Node({ node, children, className = '' }: NodeProps) {
    const { style, visibleNodes, viewMode } = useTimeline();

    // Get layout to find this node's position
    const layout = useTimelineLayout({
        nodes: visibleNodes,
        style,
        viewMode,
    });

    // Find this node's position
    const nodeIndex = visibleNodes.findIndex(n => n.id === node.id);
    const position = layout.positions[nodeIndex];

    if (!position) {
        return null;
    }

    return (
        <NodeProvider node={node} nodeIndex={nodeIndex}>
            <div
                className={`timeline-node timeline-node--${node.type} ${className}`.trim()}
                style={{
                    position: 'absolute',
                    top: position.centerY,
                    left: 0,
                    right: 0,
                    transform: 'translateY(-50%)',
                }}
                data-node-id={node.id}
                data-node-type={node.type}
            >
                {children}
            </div>
        </NodeProvider>
    );
}

export default Node;
