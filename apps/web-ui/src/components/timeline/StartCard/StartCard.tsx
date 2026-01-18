import React from 'react';
import './StartCard.css';

export interface StartCardProps {
    title: string;
    subtitle?: string;
}

const StartCard: React.FC<StartCardProps> = ({ title, subtitle }) => {
    const displayText = subtitle ? `${title}: ${subtitle}` : title;

    return (
        <div className="start-card">
            <span className="start-card__text">{displayText}</span>
        </div>
    );
};

export default StartCard;
