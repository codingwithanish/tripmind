import React from 'react';
import { TaskElement } from '../../../types/websocket.types';
import './TaskCard.css';

export interface TaskCardProps {
    task: TaskElement;
    onComplete?: (taskId: string) => void;
    onSkip?: (taskId: string) => void;
}

const statusIcons: Record<string, string> = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    skipped: '⏭️',
};

const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#10b981',
    skipped: '#6b7280',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onSkip }) => {
    const formatPrice = (price: TaskElement['price']): string => {
        if (!price) return '';

        if (price.type === 'confirmed' && price.confirmed_price) {
            return `${price.unit} ${price.confirmed_price}`;
        }
        if (price.type === 'range' && price.price_range) {
            return `${price.unit} ${price.price_range.min} - ${price.price_range.max}`;
        }
        return '';
    };

    const isActionable = task.execution_state === 'pending' || task.execution_state === 'in_progress';

    return (
        <div
            className={`task-card task-card--${task.execution_state}`}
            style={{ borderLeftColor: statusColors[task.execution_state] }}
        >
            {task.title_image && (
                <div className="task-card__image">
                    <img src={task.title_image} alt={task.title} />
                </div>
            )}

            <div className="task-card__content">
                <div className="task-card__header">
                    <span className="task-card__status-icon">{statusIcons[task.execution_state]}</span>
                    <h4 className="task-card__title">{task.title}</h4>
                </div>

                <p className="task-card__description">{task.description}</p>

                <div className="task-card__footer">
                    {task.price && (
                        <span className="task-card__price">{formatPrice(task.price)}</span>
                    )}

                    {isActionable && (
                        <div className="task-card__actions">
                            {onComplete && (
                                <button
                                    className="task-card__btn task-card__btn--complete"
                                    onClick={() => onComplete(task.id)}
                                    title="Mark as complete"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </button>
                            )}
                            {onSkip && (
                                <button
                                    className="task-card__btn task-card__btn--skip"
                                    onClick={() => onSkip(task.id)}
                                    title="Skip this task"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="5 4 15 12 5 20 5 4"></polygon>
                                        <line x1="19" y1="5" x2="19" y2="19"></line>
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
