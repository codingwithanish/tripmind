// Connector Component - Tree-like lines connecting node marker → date badge → cards
// Handles nodes with and without date badges

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useNode, useTimeline } from '../TimelineContext';
import { useTimelineLayout } from '../hooks';

interface ConnectorProps {
    className?: string;
}

export function Connector({ className = '' }: ConnectorProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const { node, nodeIndex } = useNode();
    const { style, visibleNodes, viewMode } = useTimeline();

    const layout = useTimelineLayout({
        nodes: visibleNodes,
        style,
        viewMode,
    });

    const position = layout.positions[nodeIndex];
    const hasDateBadge = !!node.display_date?.label;

    useEffect(() => {
        if (!svgRef.current || !position) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous

        const spineX = style.spine.x;
        const nodeSize = node.type === 'start' || node.type === 'end'
            ? style.node.size.start
            : style.node.size.default;

        const lineColor = '#d1d5db'; // Light gray for lines
        const lineWidth = 2;

        // Key positions
        const nodeRightEdge = spineX + nodeSize;
        const dateBadgeLeft = spineX + nodeSize + style.spacing.dateBadgeDistance;
        const dateBadgeRight = dateBadgeLeft + style.spacing.dateBadgeWidth;
        const cardLeft = style.spacing.cardDistance;

        // If no date badge and no cards, just draw line from node to card area
        if (!hasDateBadge) {
            if (position.cards.length > 0) {
                // Direct line from node to card area
                const branchX = nodeRightEdge + 30;

                // Horizontal line from node
                svg.append('line')
                    .attr('x1', nodeRightEdge)
                    .attr('y1', 0)
                    .attr('x2', branchX)
                    .attr('y2', 0)
                    .attr('stroke', lineColor)
                    .attr('stroke-width', lineWidth);

                // Vertical branch if multiple cards
                if (position.cards.length > 1) {
                    const minY = Math.min(...position.cards.map(c => c.y));
                    const maxY = Math.max(...position.cards.map(c => c.y));
                    svg.append('line')
                        .attr('x1', branchX)
                        .attr('y1', minY)
                        .attr('x2', branchX)
                        .attr('y2', maxY)
                        .attr('stroke', lineColor)
                        .attr('stroke-width', lineWidth);
                }

                // Lines to each card
                position.cards.forEach((card) => {
                    svg.append('line')
                        .attr('x1', branchX)
                        .attr('y1', card.y)
                        .attr('x2', cardLeft - 8)
                        .attr('y2', card.y)
                        .attr('stroke', lineColor)
                        .attr('stroke-width', lineWidth);
                });
            }
            return;
        }

        // ===== With date badge: Draw full tree structure =====

        // LINE 1: Node to Date Badge (single continuous line)
        svg.append('line')
            .attr('class', 'connector-line--node-to-date')
            .attr('x1', nodeRightEdge)
            .attr('y1', 0)
            .attr('x2', dateBadgeLeft - 5)
            .attr('y2', 0)
            .attr('stroke', lineColor)
            .attr('stroke-width', lineWidth);

        // Only draw to cards if there are cards
        if (position.cards.length > 0) {
            // LINE 2: Date Badge to Branch Point
            const branchX = dateBadgeRight + 20;

            svg.append('line')
                .attr('class', 'connector-line--date-to-branch')
                .attr('x1', dateBadgeRight + 5)
                .attr('y1', 0)
                .attr('x2', branchX)
                .attr('y2', 0)
                .attr('stroke', lineColor)
                .attr('stroke-width', lineWidth);

            // LINE 3: Vertical Branch (only if multiple cards)
            if (position.cards.length > 1) {
                const minY = Math.min(...position.cards.map(c => c.y));
                const maxY = Math.max(...position.cards.map(c => c.y));

                svg.append('line')
                    .attr('class', 'connector-line--vertical')
                    .attr('x1', branchX)
                    .attr('y1', minY)
                    .attr('x2', branchX)
                    .attr('y2', maxY)
                    .attr('stroke', lineColor)
                    .attr('stroke-width', lineWidth);
            }

            // LINE 4: Branch to Each Card
            position.cards.forEach((card) => {
                svg.append('line')
                    .attr('class', 'connector-line--to-card')
                    .attr('x1', branchX)
                    .attr('y1', card.y)
                    .attr('x2', cardLeft - 8)
                    .attr('y2', card.y)
                    .attr('stroke', lineColor)
                    .attr('stroke-width', lineWidth);
            });
        }

    }, [position, style, node.type, nodeIndex, hasDateBadge]);

    if (!position) {
        return null;
    }

    // Calculate SVG bounds
    const maxY = position.cards.length > 0
        ? Math.max(...position.cards.map(c => Math.abs(c.y))) + 30
        : 40;
    const width = style.spacing.cardDistance + 50;

    return (
        <svg
            ref={svgRef}
            className={`timeline-connector ${className}`.trim()}
            style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: width,
                height: maxY * 2,
                overflow: 'visible',
                pointerEvents: 'none',
                zIndex: 1,
            }}
        />
    );
}

export default Connector;
