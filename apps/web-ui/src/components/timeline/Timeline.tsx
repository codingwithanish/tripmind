// Timeline V2 - Main Component
// Renders timeline nodes with action cards and representation cards

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
    TimelineNode,
    TaskElement,
    RecommendationElement,
    TimelineRendererProps,
} from './TimelineTypes';
import { TimelineConfig, getSeverityFromNode, mapIcon } from './TimelineTypes';
import './Timeline.css';

// ============================================================
// ICONIFY COMPONENT WRAPPER
// ============================================================

interface IconProps {
    icon: string;
    className?: string;
}

// Using the iconify-icon web component
const Icon: React.FC<IconProps> = ({ icon, className }) => {
    return React.createElement('iconify-icon', { icon, class: className });
};

// ============================================================
// TASK ITEM COMPONENT
// ============================================================

interface TaskItemComponentProps {
    item: TaskElement | RecommendationElement;
    type: 'task' | 'recommendation';
}

const TaskItem: React.FC<TaskItemComponentProps> = ({ item, type }) => {
    const icon = 'title_image' in item ? mapIcon(item.title_image) : 'mdi:checkbox-marked-circle';

    // Get price info
    let priceText = '';
    let priceStatus: 'confirmed' | 'not-confirmed' = 'not-confirmed';

    if (type === 'task') {
        const task = item as TaskElement;
        if (task.price) {
            if (task.price.type === 'range' && task.price.range) {
                priceText = `${task.price.range.min}-${task.price.range.max} ${task.price.unit}`;
            } else if (task.price.type === 'confirmed' && task.price.confirmed_price) {
                priceText = `${task.price.confirmed_price} ${task.price.unit}`;
                priceStatus = 'confirmed';
            } else if (task.price.value) {
                priceText = `${task.price.value} ${task.price.unit}`;
            }
        }
    } else {
        const rec = item as RecommendationElement;
        if (rec.price_included && rec.price_info) {
            if (rec.price_info.type === 'range' && rec.price_info.range) {
                priceText = `${rec.price_info.range.min}-${rec.price_info.range.max} ${rec.price_info.unit}`;
            } else if (rec.price_info.type === 'confirmed' && rec.price_info.confirmed_price) {
                priceText = `${rec.price_info.confirmed_price} ${rec.price_info.unit}`;
                priceStatus = 'confirmed';
            } else if (rec.price_info.value) {
                priceText = `${rec.price_info.value} ${rec.price_info.unit}`;
            }
        }
    }

    return (
        <div className="task-item" data-item-id={item.id}>
            <div className="task-item-top">
                <div className="task-icon">
                    <Icon icon={icon} />
                </div>
                <div className="task-content">
                    <div className="task-title">{item.title}</div>
                    {item.description && (
                        <div className="task-subtitle">{item.description}</div>
                    )}
                </div>
            </div>
            {priceText && (
                <div className="task-item-bottom">
                    <div className={`task-price task-price--${priceStatus}`}>
                        {priceText}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// ACTION CARD COMPONENT (Flippable)
// ============================================================

interface ActionCardComponentProps {
    node: TimelineNode;
    onHelpRequest?: (nodeId: string) => void;
}

const ActionCard: React.FC<ActionCardComponentProps> = ({ node, onHelpRequest }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const flipTimerRef = useRef<NodeJS.Timeout | null>(null);

    const tasks = node.tasks || [];
    const recommendations = node.recommendations || [];
    const hasRecommendations = recommendations.length > 0;

    // Get display info
    const dateText = node.display_date?.label || '';
    const firstTask = tasks[0];
    const infoIcon = firstTask?.title_image
        ? mapIcon(firstTask.title_image)
        : TimelineConfig.defaultIcons.action;
    const infoText = firstTask?.title || 'Action';

    // Auto-flip timer management
    const startAutoFlipTimer = useCallback(() => {
        if (flipTimerRef.current) {
            clearTimeout(flipTimerRef.current);
        }
        flipTimerRef.current = setTimeout(() => {
            setIsFlipped(false);
        }, TimelineConfig.autoFlipDelay);
    }, []);

    const clearAutoFlipTimer = useCallback(() => {
        if (flipTimerRef.current) {
            clearTimeout(flipTimerRef.current);
            flipTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => clearAutoFlipTimer();
    }, [clearAutoFlipTimer]);

    const handleFlip = () => {
        if (isFlipped) {
            setIsFlipped(false);
            clearAutoFlipTimer();
        } else {
            setIsFlipped(true);
            startAutoFlipTimer();
        }
    };

    const handleHelpClick = () => {
        onHelpRequest?.(node.id);
    };

    const handleMouseMove = () => {
        if (isFlipped) {
            startAutoFlipTimer(); // Reset timer on interaction
        }
    };

    return (
        <div className="action-card-container">
            <div
                className={`action-card-flipper ${isFlipped ? 'action-card-flipper--flipped' : ''}`}
                onMouseMove={handleMouseMove}
            >
                {/* Front - Tasks */}
                <div className="action-card-front">
                    <div className="card-header">
                        <div className="header-icon">
                            <Icon icon={infoIcon} />
                        </div>
                        <div className="header-content">
                            <div className="header-date">{dateText}</div>
                            <div className="header-title">{infoText}</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="section-label">Actions</div>
                        <div className="task-list">
                            {tasks.length > 0 ? (
                                tasks.map((task: TaskElement) => (
                                    <TaskItem key={task.id} item={task} type="task" />
                                ))
                            ) : (
                                <div className="empty-state">No actions available</div>
                            )}
                        </div>
                    </div>
                    <div className="card-footer">
                        {hasRecommendations && (
                            <button className="footer-btn footer-btn--primary" onClick={handleFlip}>
                                Show More Recommendations
                            </button>
                        )}
                        <button className="footer-btn footer-btn--secondary" onClick={handleHelpClick}>
                            I Need Some Help Here
                        </button>
                    </div>
                </div>

                {/* Back - Recommendations */}
                <div className="action-card-back">
                    <div className="card-header">
                        <div className="header-icon header-icon--back" onClick={handleFlip}>
                            <Icon icon={TimelineConfig.defaultIcons.back} />
                        </div>
                        <div className="header-content">
                            <div className="header-date">{dateText}</div>
                            <div className="header-title">{infoText}</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="section-label">Our Recommendations</div>
                        <div className="task-list">
                            {hasRecommendations ? (
                                recommendations.map((rec: RecommendationElement) => (
                                    <TaskItem key={rec.id} item={rec} type="recommendation" />
                                ))
                            ) : (
                                <div className="empty-state">No recommendations available for this action.</div>
                            )}
                        </div>
                    </div>
                    <div className="card-footer">
                        <button className="footer-btn footer-btn--secondary" onClick={handleHelpClick}>
                            I Need Some Help Here
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// REPRESENTATION CARD COMPONENT
// ============================================================

interface RepresentationCardComponentProps {
    node: TimelineNode;
}

const RepresentationCard: React.FC<RepresentationCardComponentProps> = ({ node }) => {
    const severity = getSeverityFromNode(node);
    const rep = node.representations?.[0];

    if (!rep) return null;

    const icon = mapIcon(rep.icon);

    return (
        <div className={`representation-card representation-card--severity-${severity}`}>
            <div className="representation-icon">
                <Icon icon={icon} />
            </div>
            <div className="representation-content">
                <div className="representation-title">{rep.title}</div>
            </div>
        </div>
    );
};

// ============================================================
// BOUNDARY CARD COMPONENT (Start/End)
// ============================================================

interface BoundaryCardProps {
    type: 'start' | 'end';
    node: TimelineNode;
}

const BoundaryCard: React.FC<BoundaryCardProps> = ({ type, node }) => {
    const icon = type === 'start' ? TimelineConfig.defaultIcons.start : TimelineConfig.defaultIcons.end;
    const label = type === 'start' ? 'Journey Begins' : 'Journey Ends';

    return (
        <div className={`timeline-boundary-card timeline-boundary-card--${type}`}>
            <div className="timeline-boundary-icon">
                <Icon icon={icon} />
            </div>
            <div className="timeline-boundary-content">
                {node.display_date?.label && (
                    <div className="timeline-boundary-date">{node.display_date.label}</div>
                )}
                <div className="timeline-boundary-label">{label}</div>
            </div>
        </div>
    );
};

// ============================================================
// TIMELINE NODE COMPONENT
// ============================================================

interface TimelineNodeComponentProps {
    node: TimelineNode;
    isLast: boolean;
    onHelpRequest?: (nodeId: string) => void;
}

const TimelineNodeComponent: React.FC<TimelineNodeComponentProps> = ({
    node,
    isLast,
    onHelpRequest,
}) => {
    const config = TimelineConfig.spacing;

    // Determine node type and severity
    const isAction = node.type === 'task_node' && node.subtype !== 'additional_input';
    const isRepresentation = node.type === 'representation_node';
    const isStart = node.type === 'start';
    const isEnd = node.type === 'end';

    const severity = isRepresentation ? getSeverityFromNode(node) : undefined;

    // Calculate circle position
    let circleTop = config.circleOffset;
    if (isRepresentation) {
        // Center circle vertically with representation card
        circleTop = (config.representationHeight / 2) - (config.circleSize / 2);
    }

    // Connector positions
    const horizontalConnectorTop = circleTop + (config.circleSize / 2) - (config.lineHeight / 2);
    const verticalConnectorTop = circleTop + (config.circleSize / 2);

    // Connector class
    let connectorClass = 'node-connector--action';
    let verticalClass = 'node-vertical-connector--action';
    if (isRepresentation && severity) {
        connectorClass = `node-connector--severity-${severity}`;
        verticalClass = `node-vertical-connector--severity-${severity}`;
    }

    // Circle class
    let circleClass = 'node-circle--action';
    if (isRepresentation) {
        circleClass = `node-circle--representation severity-${severity || 'low'}`;
    }

    // Get icon for circle
    let circleIcon: string = TimelineConfig.defaultIcons.action;
    if (isRepresentation) {
        const rep = node.representations?.[0];
        circleIcon = mapIcon(rep?.icon);
    } else if (isStart) {
        circleIcon = TimelineConfig.defaultIcons.start;
    } else if (isEnd) {
        circleIcon = TimelineConfig.defaultIcons.end;
    } else if (node.tasks?.[0]?.title_image) {
        circleIcon = mapIcon(node.tasks[0].title_image);
    }

    return (
        <div
            className="timeline-node"
            data-node-id={node.id}
            style={{ marginBottom: config.nodeBuffer }}
        >
            {/* Node Circle */}
            <div
                className={`node-circle ${circleClass}`}
                style={{ top: circleTop }}
            >
                <Icon icon={circleIcon} />
            </div>

            {/* Horizontal Connector */}
            {!isStart && !isEnd && (
                <div
                    className={`node-connector ${connectorClass}`}
                    style={{ top: horizontalConnectorTop }}
                />
            )}

            {/* Vertical Connector (to next node) */}
            {!isLast && (
                <div
                    className={`node-vertical-connector ${verticalClass}`}
                    style={{
                        top: verticalConnectorTop,
                        height: `calc(100% - ${verticalConnectorTop}px + ${config.nodeBuffer}px + ${config.circleSize}px)`,
                    }}
                />
            )}

            {/* Card Content */}
            <div className="card-wrapper">
                {isStart && <BoundaryCard type="start" node={node} />}
                {isEnd && <BoundaryCard type="end" node={node} />}
                {isAction && <ActionCard node={node} onHelpRequest={onHelpRequest} />}
                {isRepresentation && <RepresentationCard node={node} />}
            </div>
        </div>
    );
};

// ============================================================
// TIMELINE RENDERER (Main Export)
// ============================================================

export function TimelineRenderer({
    data,
    className = '',
    onHelpRequest,
}: TimelineRendererProps) {
    if (!data) {
        return (
            <div className={`timeline-container ${className}`.trim()}>
                <div className="timeline-loading">
                    <div className="timeline-loading__spinner" />
                    <p>Loading timeline...</p>
                </div>
            </div>
        );
    }

    // Sort nodes by order
    const sortedNodes = [...data.nodes].sort((a, b) => a.order - b.order);

    return (
        <div className={`timeline-container ${className}`.trim()}>
            {sortedNodes.map((node, index) => (
                <TimelineNodeComponent
                    key={node.id}
                    node={node}
                    isLast={index === sortedNodes.length - 1}
                    onHelpRequest={onHelpRequest}
                />
            ))}
        </div>
    );
}

// Default export for backwards compatibility
export default TimelineRenderer;

// Re-export types
export type * from './TimelineTypes';
