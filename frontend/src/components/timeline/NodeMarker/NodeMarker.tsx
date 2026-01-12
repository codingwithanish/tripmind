import React from 'react';
import './NodeMarker.css';

export interface NodeMarkerProps {
    type: 'start' | 'end' | 'task' | 'representation' | 'additional_input';
    size?: 'small' | 'medium' | 'large';
    icon?: React.ReactNode;
}

const NodeMarker: React.FC<NodeMarkerProps> = ({ type, size = 'medium', icon }) => {
    // Determine if marker should be open (ring) or filled
    const isOpen = type === 'additional_input';
    const isSquare = type === 'representation';

    const getIcon = () => {
        if (icon) return icon;
        if (type === 'start') return '▶';
        if (type === 'end') return '🏁';
        return null;
    };

    const markerIcon = getIcon();

    return (
        <div
            className={`node-marker node-marker--${size} node-marker--${type} ${isOpen ? 'node-marker--open' : 'node-marker--filled'}`}
        >
            {markerIcon && <span className="node-marker__icon">{markerIcon}</span>}
        </div>
    );
};

export default NodeMarker;
