// Spine Component - The main vertical line of the timeline
// Rendered using D3 for smooth animations

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTimeline } from '../TimelineContext';
import { useTimelineLayout } from '../hooks';

interface SpineProps {
    className?: string;
}

export function Spine({ className = '' }: SpineProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const { style, visibleNodes, viewMode } = useTimeline();

    // Calculate layout to get spine bounds
    const layout = useTimelineLayout({
        nodes: visibleNodes,
        style,
        viewMode,
    });

    useEffect(() => {
        if (!svgRef.current || visibleNodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('.timeline-spine-line').remove();

        const { spineStart, spineEnd } = layout;
        const spineConfig = style.spine;

        // Draw the main spine line with animation
        svg.append('line')
            .attr('class', 'timeline-spine-line')
            .attr('x1', spineConfig.x)
            .attr('y1', spineStart)
            .attr('x2', spineConfig.x)
            .attr('y2', spineStart) // Start at top
            .attr('stroke', spineConfig.strokeColor)
            .attr('stroke-width', spineConfig.strokeWidth)
            .attr('stroke-linecap', spineConfig.strokeLinecap)
            .transition()
            .duration(style.animation.duration)
            .attr('y2', spineEnd); // Animate to bottom

    }, [layout, style, visibleNodes.length]);

    return (
        <svg
            ref={svgRef}
            className={`timeline-spine ${className}`.trim()}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: layout.totalHeight,
                pointerEvents: 'none',
            }}
        />
    );
}

export default Spine;
