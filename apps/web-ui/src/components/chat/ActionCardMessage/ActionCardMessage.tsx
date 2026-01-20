import React from 'react';
import type { TimelineNode, TaskElement } from '../../../types/websocket.types';
import './ActionCardMessage.css';

interface ActionCardMessageProps {
    node: TimelineNode;
}

// Using the iconify-icon web component
const Icon: React.FC<{ icon: string }> = ({ icon }) => {
    return React.createElement('iconify-icon', { icon, class: 'action-card-msg__icon' });
};

const mapIcon = (icon?: string): string => {
    if (!icon) return 'mdi:checkbox-marked-circle';
    if (icon.includes(':')) return icon;
    return `mdi:${icon}`;
};

const ActionCardMessage: React.FC<ActionCardMessageProps> = ({ node }) => {
    const tasks = node.tasks || [];
    const dateLabel = node.display_date?.label || '';
    const firstTask = tasks[0];
    const headerIcon = firstTask?.title_image ? mapIcon(firstTask.title_image) : 'mdi:airplane';
    const headerTitle = firstTask?.title || 'Action';

    return (
        <div className="action-card-msg">
            <div className="action-card-msg__header">
                <div className="action-card-msg__header-icon">
                    <Icon icon={headerIcon} />
                </div>
                <div className="action-card-msg__header-content">
                    {dateLabel && <span className="action-card-msg__date">{dateLabel}</span>}
                    <span className="action-card-msg__title">{headerTitle}</span>
                </div>
            </div>

            {tasks.length > 0 && (
                <div className="action-card-msg__tasks">
                    {tasks.map((task: TaskElement) => (
                        <div key={task.id} className="action-card-msg__task">
                            <Icon icon={mapIcon(task.title_image)} />
                            <div className="action-card-msg__task-content">
                                <span className="action-card-msg__task-title">{task.title}</span>
                                {task.description && (
                                    <span className="action-card-msg__task-desc">{task.description}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="action-card-msg__prompt">
                <Icon icon="mdi:help-circle-outline" />
                <span>How can I help you with this?</span>
            </div>
        </div>
    );
};

export default ActionCardMessage;
