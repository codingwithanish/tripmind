import React from 'react';
import './EndCard.css';

export interface EndCardProps {
    title?: string;
}

const EndCard: React.FC<EndCardProps> = ({ title = 'Trip Complete' }) => {
    return (
        <div className="end-card">
            <span className="end-card__icon">🏁</span>
            <span className="end-card__text">{title}</span>
        </div>
    );
};

export default EndCard;
