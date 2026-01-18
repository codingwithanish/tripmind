// Timeline - Main compound component export
// Provides the Timeline.* API as specified in the design

import React from 'react';
import { TimelineProvider } from './TimelineContext';
import { Spine, Node, Marker, Connector, Content, DateBadge } from './components';
import { StartSlot, EndSlot, ActivitySlot, RepresentationSlot, UserInputSlot } from './components/slots';
import type { TimelineRootProps, TimelineNode } from './TimelineTypes';
import './Timeline.css';

// ============= Root Component =============

function Root({
    data,
    style = 'default',
    className = '',
    children,
    onTaskComplete,
    onTaskSkip,
    onRecommendationAccept,
    onRecommendationIgnore,
    onAdditionalInput,
}: TimelineRootProps) {
    return (
        <TimelineProvider
            data={data}
            styleName={style}
            onTaskComplete={onTaskComplete}
            onTaskSkip={onTaskSkip}
            onRecommendationAccept={onRecommendationAccept}
            onRecommendationIgnore={onRecommendationIgnore}
            onAdditionalInput={onAdditionalInput}
        >
            <div className={`timeline-root ${className}`.trim()}>
                {children}
            </div>
        </TimelineProvider>
    );
}

// ============= Compound Component Export =============

export const Timeline = {
    // Root container
    Root,

    // Core structural components
    Spine,
    Node,
    Marker,
    Connector,
    Content,
    DateBadge,

    // Node type slots
    Start: StartSlot,
    End: EndSlot,
    Activity: ActivitySlot,
    Representation: RepresentationSlot,
    UserInput: UserInputSlot,
} as const;

// ============= Default Renderer Component =============

interface TimelineRendererProps extends Omit<TimelineRootProps, 'children'> {
    renderNode?: (node: TimelineNode) => React.ReactNode;
}

/**
 * Default Timeline renderer that handles common patterns
 * Can be used as-is or as reference for custom implementations
 */
export function TimelineRenderer({
    data,
    style,
    className,
    renderNode,
    ...eventHandlers
}: TimelineRendererProps) {
    if (!data) {
        return (
            <div className={`timeline-root timeline-root--loading ${className || ''}`.trim()}>
                <div className="timeline-loading">
                    <div className="timeline-loading__spinner" />
                    <p>Loading timeline...</p>
                </div>
            </div>
        );
    }

    const sortedNodes = [...data.nodes].sort((a, b) => a.order - b.order);

    return (
        <Timeline.Root data={data} style={style} className={className} {...eventHandlers}>
            <Timeline.Spine />
            {sortedNodes.map(node => (
                <Timeline.Node key={node.id} node={node}>
                    {renderNode ? renderNode(node) : (
                        <>
                            <Timeline.Marker />
                            <Timeline.DateBadge />
                            <Timeline.Connector />
                            <Timeline.Content>
                                {/* Default content based on node type */}
                                <DefaultNodeContent node={node} />
                            </Timeline.Content>
                        </>
                    )}
                </Timeline.Node>
            ))}
        </Timeline.Root>
    );
}

// ============= Default Node Content =============

interface DefaultNodeContentProps {
    node: TimelineNode;
}

function DefaultNodeContent({ node }: DefaultNodeContentProps) {
    switch (node.type) {
        case 'start':
            return (
                <div className="timeline-card timeline-card--start">
                    <span className="timeline-card__date">{node.display_date?.label}</span>
                    <span className="timeline-card__label">Journey Begins</span>
                </div>
            );

        case 'end':
            return (
                <div className="timeline-card timeline-card--end">
                    <span className="timeline-card__date">{node.display_date?.label}</span>
                    <span className="timeline-card__label">Journey Ends</span>
                </div>
            );

        case 'representation_node':
            const rep = node.representations?.[0];
            return rep ? (
                <div className="timeline-card timeline-card--representation">
                    {rep.image && <img src={rep.image} alt={rep.title} className="timeline-card__image" />}
                    <div className="timeline-card__body">
                        <h4 className="timeline-card__title">
                            {rep.icon && <span className="timeline-card__icon">{rep.icon === 'sun' ? '☀️' : '📌'}</span>}
                            {rep.title}
                        </h4>
                        <p className="timeline-card__description">{rep.description}</p>
                    </div>
                </div>
            ) : null;

        case 'task_node':
        default:
            // Check if this is an additional_input subtype
            if (node.subtype === 'additional_input' && node.additional_input) {
                return (
                    <div className="timeline-card timeline-card--input">
                        <span className="timeline-card__icon">❓</span>
                        <p className="timeline-card__question">{node.additional_input.question}</p>
                        <div className="timeline-card__input-hint">
                            <span>⏸️</span> Answer to continue
                        </div>
                    </div>
                );
            }

            // For action nodes, we'd typically render tasks/recommendations
            return (
                <div className="timeline-card timeline-card--action">
                    <span className="timeline-card__date">{node.display_date?.label}</span>
                    {node.tasks && node.tasks.length > 0 && (
                        <div className="timeline-card__tasks">
                            {node.tasks.map(task => (
                                <div key={task.id} className="timeline-card__task-item">
                                    <span className="timeline-card__task-status">
                                        {task.execution_state === 'completed' ? '✅' : '⏳'}
                                    </span>
                                    <span className="timeline-card__task-title">{task.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
    }
}

// ============= Re-exports =============

export { useTimeline, useNode } from './TimelineContext';
export { useTimelineLayout, useTimelineAnimation, useStyleConfig } from './hooks';
export type * from './TimelineTypes';
export type { TimelineStyle } from './styles';
