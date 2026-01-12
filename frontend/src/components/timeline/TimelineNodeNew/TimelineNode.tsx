import React from 'react';
import { TimelineNode as TimelineNodeType } from '../../../types/websocket.types';
import NodeMarker from '../NodeMarker';
import StartCard from '../StartCard';
import EndCard from '../EndCard';
import TaskCardNew from '../TaskCardNew';
import RepresentationCardNew from '../RepresentationCardNew';
import AdditionalInputCardNew from '../AdditionalInputCardNew';
import './TimelineNode.css';

export interface TimelineNodeProps {
    node: TimelineNodeType;
    isLast?: boolean;
    onTaskComplete?: (taskId: string) => void;
    onTaskSkip?: (taskId: string) => void;
    onAdditionalInput?: (value: string) => void;
}

const TimelineNodeComponent: React.FC<TimelineNodeProps> = ({
    node,
    isLast = false,
    onTaskComplete,
    onTaskSkip,
    onAdditionalInput,
}) => {
    const getMarkerType = (): 'start' | 'end' | 'task' | 'representation' | 'additional_input' => {
        if (node.type === 'start') return 'start';
        if (node.type === 'end') return 'end';
        if (node.subtype === 'additional_input') return 'additional_input';
        if (node.representations && node.representations.length > 0 && (!node.tasks || node.tasks.length === 0)) {
            return 'representation';
        }
        return 'task';
    };

    // Collect all elements to render
    const getAllElements = () => {
        const elements: React.ReactNode[] = [];

        node.representations?.forEach((rep) => {
            elements.push(
                <RepresentationCardNew key={rep.id} representation={rep} />
            );
        });

        node.tasks?.forEach((task) => {
            elements.push(
                <TaskCardNew
                    key={task.id}
                    task={task}
                    onComplete={onTaskComplete}
                    onSkip={onTaskSkip}
                />
            );
        });

        if (node.subtype === 'additional_input' && node.additional_input) {
            elements.push(
                <AdditionalInputCardNew
                    key="additional-input"
                    input={node.additional_input}
                    onSubmit={onAdditionalInput}
                />
            );
        }

        return elements;
    };

    const renderStartNode = () => (
        <div className="timeline-node__row timeline-node__row--single">
            <div className="timeline-node__connector-group">
                <div className="timeline-node__arrow timeline-node__arrow--single" />
            </div>
            <StartCard title="Trip Start" subtitle={node.display_date?.label} />
        </div>
    );

    const renderEndNode = () => (
        <div className="timeline-node__row timeline-node__row--single">
            <div className="timeline-node__connector-group">
                <div className="timeline-node__arrow timeline-node__arrow--single timeline-node__arrow--end" />
            </div>
            <EndCard title="Trip Complete" />
        </div>
    );

    const renderTaskNode = () => {
        const elements = getAllElements();

        if (elements.length === 0) return null;

        if (elements.length === 1) {
            return (
                <div className="timeline-node__row timeline-node__row--single">
                    <div className="timeline-node__connector-group">
                        <div className="timeline-node__arrow timeline-node__arrow--single">
                            <div className="timeline-node__arrowhead" />
                        </div>
                    </div>
                    <div className="timeline-node__card">{elements[0]}</div>
                </div>
            );
        }

        // Multiple elements - branching layout
        return (
            <div className="timeline-node__row timeline-node__row--branched">
                {/* Horizontal stem from date badge */}
                <div className="timeline-node__branch-stem" />

                {/* Vertical line + branches */}
                <div className="timeline-node__branch-container">
                    <div className="timeline-node__branch-vertical" />
                    {elements.map((el, idx) => (
                        <div key={idx} className="timeline-node__branch-item">
                            <div className="timeline-node__branch-arm">
                                <div className="timeline-node__arrowhead" />
                            </div>
                            <div className="timeline-node__card">{el}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={`timeline-node timeline-node--${node.type} ${node.subtype ? `timeline-node--${node.subtype}` : ''}`}>
            {/* Spine with marker */}
            <div className="timeline-node__spine">
                <div className="timeline-node__spine-line timeline-node__spine-line--top" />
                <NodeMarker type={getMarkerType()} size="medium" />
                {!isLast && <div className="timeline-node__spine-line timeline-node__spine-line--bottom" />}
            </div>

            {/* Date badge + connector area */}
            <div className="timeline-node__connector-area">
                {node.display_date?.label && node.type === 'task_node' && (
                    <div className="timeline-node__date-badge">{node.display_date.label}</div>
                )}
            </div>

            {/* Content area */}
            <div className="timeline-node__content">
                {node.type === 'start' && renderStartNode()}
                {node.type === 'end' && renderEndNode()}
                {node.type === 'task_node' && renderTaskNode()}
            </div>
        </div>
    );
};

export default TimelineNodeComponent;
