import React from 'react';
import { RepresentationElement } from '../../../types/websocket.types';
import './RepresentationCardNew.css';

export interface RepresentationCardNewProps {
    representation: RepresentationElement;
}

const RepresentationCardNew: React.FC<RepresentationCardNewProps> = ({ representation }) => {
    // Get icon based on title keywords
    const getIcon = (): string => {
        const title = representation.title.toLowerCase();
        if (title.includes('weather')) return '🌧️';
        if (title.includes('info')) return 'ℹ️';
        if (title.includes('tip')) return '💡';
        if (title.includes('warning')) return '⚠️';
        return '📋';
    };

    return (
        <div className="representation-card">
            {/* Square icon box */}
            <div className="representation-card__icon-box">
                {representation.image ? (
                    <img
                        src={representation.image}
                        alt={representation.title}
                        className="representation-card__icon-image"
                    />
                ) : (
                    <span className="representation-card__icon-emoji">{representation.icon || getIcon()}</span>
                )}
            </div>

            {/* Connector line */}
            <div className="representation-card__connector" />

            {/* Text card */}
            <div className="representation-card__text">
                <span className="representation-card__title">{representation.title}</span>
                {representation.description && (
                    <span className="representation-card__description">: {representation.description}</span>
                )}
            </div>
        </div>
    );
};

export default RepresentationCardNew;
