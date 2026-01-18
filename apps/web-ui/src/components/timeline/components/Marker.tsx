// Marker Component - The circle/icon on the spine for each node
// Includes animation and pulsing effect for blocking nodes

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useNode, useTimeline } from '../TimelineContext';

interface MarkerProps {
    className?: string;
}

export function Marker({ className = '' }: MarkerProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const { node, isBlocking } = useNode();
    const { style } = useTimeline();

    // Determine marker size and color based on node type
    const nodeType = node.type as keyof typeof style.node.colors;
    const color = style.node.colors[nodeType] || style.node.colors.task_node;
    const size = node.type === 'start' || node.type === 'end'
        ? style.node.size.start
        : style.node.size.default;

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const cx = style.spine.x;
        const cy = size + 5; // Center with some padding

        // Create marker group
        const g = svg.append('g').attr('class', 'marker-group');

        // Pulsing background for blocking nodes
        if (isBlocking) {
            g.append('circle')
                .attr('class', 'marker-pulse')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', size)
                .attr('fill', color)
                .attr('opacity', 0.3)
                .style('animation', 'timeline-pulse 1.5s ease-in-out infinite');
        }

        // Main circle with entrance animation
        g.append('circle')
            .attr('class', 'marker-circle')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', 0)
            .attr('fill', color)
            .attr('stroke', style.node.strokeColor)
            .attr('stroke-width', style.node.strokeWidth)
            .style('filter', `drop-shadow(${style.node.shadow})`)
            .transition()
            .duration(style.animation.duration)
            .ease(d3.easeBounceOut)
            .attr('r', size);

        // Icon for start/end nodes
        if (node.type === 'start' || node.type === 'end') {
            g.append('text')
                .attr('x', cx)
                .attr('y', cy)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', `${size * 0.6}px`)
                .attr('fill', 'white')
                .attr('opacity', 0)
                .text(node.type === 'start' ? '▶' : '■')
                .transition()
                .delay(style.animation.duration / 2)
                .duration(style.animation.duration / 2)
                .attr('opacity', 1);
        }

    }, [node.type, color, size, style, isBlocking]);

    const markerHeight = (size + 5) * 2;

    return (
        <svg
            ref={svgRef}
            className={`timeline-marker ${isBlocking ? 'timeline-marker--blocking' : ''} ${className}`.trim()}
            style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: style.spine.x + size + 10,
                height: markerHeight,
                overflow: 'visible',
                pointerEvents: 'none',
            }}
        />
    );
}

export default Marker;
