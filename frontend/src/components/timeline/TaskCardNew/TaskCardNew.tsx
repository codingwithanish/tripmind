import React from 'react';
import { TaskElement } from '../../../types/websocket.types';
import './TaskCardNew.css';

export interface TaskCardNewProps {
    task: TaskElement;
    onComplete?: (taskId: string) => void;
    onSkip?: (taskId: string) => void;
}

const TaskCardNew: React.FC<TaskCardNewProps> = ({ task, onComplete, onSkip }) => {
    // Get icon based on title keywords
    const getIcon = (): string => {
        const title = task.title.toLowerCase();
        if (title.includes('flight') || title.includes('fly')) return '✈️';
        if (title.includes('hotel') || title.includes('accommodation') || title.includes('stay')) return '🏨';
        if (title.includes('activity') || title.includes('visit') || title.includes('tour')) return '🎯';
        if (title.includes('car') || title.includes('transport') || title.includes('taxi')) return '🚗';
        if (title.includes('restaurant') || title.includes('food') || title.includes('dining')) return '🍽️';
        if (title.includes('insurance')) return '🛡️';
        if (title.includes('weather')) return '🌤️';
        if (title.includes('book')) return '📖';
        return '📋';
    };

    const getStatusClass = (): string => {
        switch (task.execution_state) {
            case 'completed': return 'task-card--confirmed';
            case 'skipped': return 'task-card--skipped';
            case 'in_progress': return 'task-card--progress';
            default: return 'task-card--pending';
        }
    };

    const getStatusText = (): string => {
        switch (task.visit_status) {
            case 'confirmed': return '(Confirmed)';
            case 'waitinglist': return '(Waitlist)';
            default: return '(Pending)';
        }
    };

    const formatPrice = (): string | null => {
        if (!task.price) return null;
        const { price } = task;

        if (price.type === 'confirmed' && price.confirmed_price) {
            return `$${price.confirmed_price}`;
        }
        if (price.type === 'constant' && price.value) {
            return `$${price.value}`;
        }
        if (price.type === 'range' && (price.range || price.price_range)) {
            const range = price.range || price.price_range;
            if (range) {
                return `$${range.min} - $${range.max}`;
            }
        }
        return null;
    };

    const priceDisplay = formatPrice();

    return (
        <div className={`task-card ${getStatusClass()}`}>
            <div className="task-card__icon">
                {task.title_image ? (
                    <img src={task.title_image} alt={task.title} className="task-card__icon-image" />
                ) : (
                    <span className="task-card__icon-emoji">{getIcon()}</span>
                )}
            </div>
            <div className="task-card__content">
                <div className="task-card__title">{task.title}</div>
                <div className="task-card__details">
                    {priceDisplay && <span className="task-card__price">{priceDisplay}</span>}
                    <span className="task-card__status">{getStatusText()}</span>
                </div>
            </div>
        </div>
    );
};

export default TaskCardNew;
