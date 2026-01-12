import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { TimelineNode, TimelineData, RepresentationElement } from '../../../types/websocket.types';
import TaskCard from '../TaskCard';
import RecommendationCard from '../RecommendationCard';
import './TimelineChart.css';

export interface TimelineChartProps {
    timeline: TimelineData | null;
    onTaskComplete?: (taskId: string, nodeId: string) => void;
    onTaskSkip?: (taskId: string, nodeId: string) => void;
    onRecommendationAccept?: (recId: string, nodeId: string) => void;
    onRecommendationIgnore?: (recId: string, nodeId: string) => void;
    onAdditionalInput?: (nodeId: string, value: string) => void;
}

type ViewMode = 'tasks' | 'recommendations';

const nodeTypeColors: Record<string, string> = {
    start: '#10b981',
    end: '#ef4444',
    task_node: '#3b82f6',
};

// Calculate dynamic height for a node based on element count
const calculateNodeHeight = (node: TimelineNode): number => {
    const baseHeight = 60; // Minimum height for a node
    const elementHeight = 100; // Height per element

    const taskCount = node.tasks?.length || 0;
    const recCount = node.recommendations?.length || 0;
    const repCount = node.representations?.length || 0;

    // Height = max of tasks stack or recommendations stack + representations (shown on both)
    const maxElements = Math.max(taskCount, recCount) + repCount;
    return Math.max(baseHeight, maxElements * elementHeight);
};

// RepresentationCard component for displaying representation elements
const RepresentationCard: React.FC<{ rep: RepresentationElement }> = ({ rep }) => (
    <div className="representation-card">
        {rep.image && <img src={rep.image} alt={rep.title} className="representation-card__image" />}
        <div className="representation-card__content">
            <h4 className="representation-card__title">
                {rep.icon && <span className="representation-card__icon">{rep.icon === 'sun' ? '☀️' : '📌'}</span>}
                {rep.title}
            </h4>
            <p className="representation-card__description">{rep.description}</p>
        </div>
    </div>
);

const TimelineChart: React.FC<TimelineChartProps> = ({
    timeline,
    onTaskComplete,
    onTaskSkip,
    onRecommendationAccept,
    onRecommendationIgnore,
    onAdditionalInput,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('tasks');
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [dragStart, setDragStart] = useState<number | null>(null);

    // Filter nodes: stop rendering after additional_input node
    const visibleNodes = useMemo(() => {
        if (!timeline) return [];
        const sorted = [...timeline.nodes].sort((a, b) => a.order - b.order);

        const result: TimelineNode[] = [];
        for (const node of sorted) {
            result.push(node);
            // Stop after additional_input node (blocking behavior)
            if (node.subtype === 'additional_input') {
                break;
            }
        }
        return result;
    }, [timeline]);

    // Check if swipe is allowed for a node
    const canSwipe = useCallback((node: TimelineNode): boolean => {
        if (node.type !== 'task_node') return false;
        if (node.subtype === 'tasks_only') return false;
        if (node.subtype === 'recommendation_only') return false;
        if (node.subtype === 'additional_input') return false;
        if (!node.recommendations || node.recommendations.length === 0) return false;
        return true;
    }, []);

    // Handle swipe/drag gestures
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setDragStart(clientX);
    };

    const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
        if (dragStart === null) return;
        const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
        const diff = clientX - dragStart;
        const threshold = 50;

        if (diff > threshold) {
            setViewMode('recommendations');
        } else if (diff < -threshold) {
            setViewMode('tasks');
        }
        setDragStart(null);
    };

    // Calculate cumulative heights for positioning
    const nodePositions = useMemo(() => {
        const positions: { top: number; height: number }[] = [];
        let currentTop = 40; // Initial offset

        for (const node of visibleNodes) {
            if (node.type === 'start' || node.type === 'end') {
                positions.push({ top: currentTop, height: 40 });
                currentTop += 60;
            } else {
                const height = calculateNodeHeight(node);
                positions.push({ top: currentTop, height });
                currentTop += height + 30; // Gap between nodes
            }
        }
        return positions;
    }, [visibleNodes]);

    // Total timeline height
    const totalHeight = useMemo(() => {
        if (nodePositions.length === 0) return 400;
        const last = nodePositions[nodePositions.length - 1];
        return last.top + last.height + 40;
    }, [nodePositions]);

    // Render the D3 spine with arrows
    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !timeline || visibleNodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const spineX = 60;

        svg.attr('width', '100%').attr('height', totalHeight);

        const g = svg.append('g');

        // Draw spine line (dynamic height)
        const lastPos = nodePositions[nodePositions.length - 1];
        g.append('line')
            .attr('class', 'timeline-spine')
            .attr('x1', spineX)
            .attr('y1', nodePositions[0]?.top || 40)
            .attr('x2', spineX)
            .attr('y2', lastPos.top + 20)
            .attr('stroke', '#e5e7eb')
            .attr('stroke-width', 4)
            .attr('stroke-linecap', 'round');

        // Draw node markers
        visibleNodes.forEach((node, index) => {
            const pos = nodePositions[index];
            const nodeGroup = g.append('g').attr('transform', `translate(${spineX}, ${pos.top})`);

            // Node circle
            nodeGroup
                .append('circle')
                .attr('r', 0)
                .attr('fill', nodeTypeColors[node.type] || '#6b7280')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 3)
                .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
                .transition()
                .duration(400)
                .delay(index * 60)
                .attr('r', node.type === 'start' || node.type === 'end' ? 10 : 14);

            // Start/End icons
            if (node.type === 'start' || node.type === 'end') {
                nodeGroup
                    .append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', '8px')
                    .attr('fill', 'white')
                    .text(node.type === 'start' ? '▶' : '■');
            }

            // Date labels (on left side)
            if (node.display_date?.label) {
                nodeGroup
                    .append('text')
                    .attr('class', 'date-label')
                    .attr('x', -20)
                    .attr('y', 0)
                    .attr('text-anchor', 'end')
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', '11px')
                    .attr('font-weight', '500')
                    .attr('fill', '#374151')
                    .text(node.display_date.label);
            }

            // Draw arrows from node marker to elements (matching wireframe)
            if (node.type === 'task_node') {
                const repCount = node.representations?.length || 0;
                const taskCount = node.tasks?.length || 0;
                const recCount = node.recommendations?.length || 0;

                // Count elements based on view mode
                const elementsForView = viewMode === 'tasks' ? taskCount : recCount;
                const totalElements = repCount + elementsForView;

                if (totalElements > 0) {
                    // Draw arrows for each element - ALL from the node marker
                    const nodeMarkerY = pos.top; // Node marker is at pos.top

                    for (let i = 0; i < totalElements; i++) {
                        const elementY = pos.top + (i * 90) + 30; // Y position of element card
                        const arrowGroup = g.append('g').attr('class', 'arrow-group');

                        // Arrow path: starts at node marker, curves to element
                        // Using a bezier curve that branches from the node point
                        const startX = spineX + 14; // Just right of node circle
                        const startY = nodeMarkerY; // From the node marker
                        const endX = spineX + 75; // To the element card
                        const endY = elementY; // At element's vertical position

                        // Control points for smooth curve
                        const midX = startX + 25;

                        arrowGroup
                            .append('path')
                            .attr('d', `M ${startX} ${startY} 
                                        C ${midX} ${startY}, 
                                          ${midX} ${endY}, 
                                          ${endX} ${endY}`)
                            .attr('fill', 'none')
                            .attr('stroke', viewMode === 'tasks' ? '#3b82f6' : '#f59e0b')
                            .attr('stroke-width', 2)
                            .attr('opacity', 0)
                            .transition()
                            .delay(index * 60 + i * 30)
                            .duration(300)
                            .attr('opacity', 0.6);

                        // Arrowhead at the end
                        arrowGroup
                            .append('polygon')
                            .attr('points', `${endX - 6},${endY - 4} 
                                            ${endX + 2},${endY} 
                                            ${endX - 6},${endY + 4}`)
                            .attr('fill', viewMode === 'tasks' ? '#3b82f6' : '#f59e0b')
                            .attr('opacity', 0)
                            .transition()
                            .delay(index * 60 + i * 30)
                            .duration(300)
                            .attr('opacity', 0.6);
                    }
                }
            }
        });
    }, [timeline, viewMode, visibleNodes, nodePositions, totalHeight]);

    if (!timeline) {
        return (
            <div className="timeline-chart timeline-chart--loading">
                <div className="timeline-chart__loader">
                    <div className="loading-spinner"></div>
                    <p>Connecting to timeline...</p>
                </div>
            </div>
        );
    }

    const hasSwipeableNodes = visibleNodes.some(canSwipe);

    return (
        <div
            className="timeline-chart"
            ref={containerRef}
            onMouseDown={hasSwipeableNodes ? handleDragStart : undefined}
            onMouseUp={hasSwipeableNodes ? handleDragEnd : undefined}
            onTouchStart={hasSwipeableNodes ? handleDragStart : undefined}
            onTouchEnd={hasSwipeableNodes ? handleDragEnd : undefined}
        >
            {/* Swipe toggle button */}
            {hasSwipeableNodes && (
                <button
                    className="timeline-chart__swipe-toggle"
                    onClick={() => setViewMode((prev) => (prev === 'tasks' ? 'recommendations' : 'tasks'))}
                >
                    <span>{viewMode === 'tasks' ? '→ View Recommendations' : '← View Tasks'}</span>
                </button>
            )}

            <div className={`timeline-chart__content timeline-chart__content--${viewMode}`}>
                {/* SVG Spine with arrows */}
                <svg ref={svgRef} className="timeline-chart__svg"></svg>

                {/* Node Cards */}
                <div className="timeline-chart__cards" style={{ minHeight: totalHeight }}>
                    {visibleNodes.map((node, index) => {
                        const pos = nodePositions[index];
                        if (!pos) return null;

                        return (
                            <div
                                key={node.id}
                                className={`timeline-chart__node-row timeline-chart__node-row--${node.type}`}
                                style={{ top: `${pos.top - 10}px`, minHeight: `${pos.height}px` }}
                            >
                                {node.type === 'task_node' && (
                                    <div className="timeline-chart__elements">
                                        {/* Representations (shown on both views) */}
                                        {node.representations && node.representations.length > 0 && (
                                            <div className="timeline-chart__representations">
                                                {node.representations.map((rep) => (
                                                    <RepresentationCard key={rep.id} rep={rep} />
                                                ))}
                                            </div>
                                        )}

                                        {/* Tasks View */}
                                        {viewMode === 'tasks' && node.tasks && node.tasks.length > 0 && (
                                            <div className="timeline-chart__tasks">
                                                {node.tasks.map((task) => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        onComplete={(id) => onTaskComplete?.(id, node.id)}
                                                        onSkip={(id) => onTaskSkip?.(id, node.id)}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Recommendations View */}
                                        {viewMode === 'recommendations' &&
                                            node.recommendations &&
                                            node.recommendations.length > 0 && (
                                                <div className="timeline-chart__recommendations">
                                                    {node.recommendations.map((rec) => (
                                                        <RecommendationCard
                                                            key={rec.id}
                                                            recommendation={rec}
                                                            onAccept={(id) => onRecommendationAccept?.(id, node.id)}
                                                            onIgnore={(id) => onRecommendationIgnore?.(id, node.id)}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                        {/* Additional Input (Blocking) */}
                                        {node.subtype === 'additional_input' && node.additional_input && (
                                            <div className="timeline-chart__additional-input">
                                                <div className="timeline-chart__question">
                                                    <span className="timeline-chart__question-icon">❓</span>
                                                    <p>{node.additional_input.question}</p>
                                                </div>
                                                <div className="timeline-chart__blocking-notice">
                                                    <span>⏸️</span> Answer to continue building your timeline
                                                </div>
                                                <div className="timeline-chart__input-container">
                                                    <input
                                                        type="text"
                                                        value={inputValues[node.id] || ''}
                                                        onChange={(e) =>
                                                            setInputValues((prev) => ({
                                                                ...prev,
                                                                [node.id]: e.target.value,
                                                            }))
                                                        }
                                                        placeholder={
                                                            node.additional_input.placeholder || 'Type your answer...'
                                                        }
                                                        className="timeline-chart__input"
                                                    />
                                                    <button
                                                        className="timeline-chart__input-submit"
                                                        onClick={() => {
                                                            const value = inputValues[node.id];
                                                            if (value?.trim()) {
                                                                onAdditionalInput?.(node.id, value);
                                                                setInputValues((prev) => ({ ...prev, [node.id]: '' }));
                                                            }
                                                        }}
                                                        disabled={!inputValues[node.id]?.trim()}
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Empty state */}
                                        {viewMode === 'tasks' && (!node.tasks || node.tasks.length === 0) && (
                                            <div className="timeline-chart__empty-state">
                                                <p>No tasks yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TimelineChart;
