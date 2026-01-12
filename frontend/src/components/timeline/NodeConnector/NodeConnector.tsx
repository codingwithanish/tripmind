import React from 'react';
import './NodeConnector.css';

export interface NodeConnectorProps {
    type: 'horizontal' | 'branch-down' | 'branch-up';
    color?: string;
    length?: number;
}

const NodeConnector: React.FC<NodeConnectorProps> = ({
    type,
    color = '#3b82f6',
    length = 40,
}) => {
    if (type === 'horizontal') {
        return (
            <div
                className="node-connector node-connector--horizontal"
                style={{ width: length, backgroundColor: color }}
            >
                <div className="node-connector__arrow" style={{ borderLeftColor: color }} />
            </div>
        );
    }

    // For branch types, we use SVG for curved lines
    const height = type === 'branch-down' ? 40 : -40;

    return (
        <svg
            className={`node-connector node-connector--${type}`}
            width={length + 20}
            height={Math.abs(height) + 10}
            viewBox={`0 0 ${length + 20} ${Math.abs(height) + 10}`}
        >
            <path
                d={type === 'branch-down'
                    ? `M 0 0 C ${length / 2} 0, ${length / 2} ${height}, ${length} ${height}`
                    : `M 0 ${Math.abs(height)} C ${length / 2} ${Math.abs(height)}, ${length / 2} 0, ${length} 0`
                }
                fill="none"
                stroke={color}
                strokeWidth="2"
            />
            <polygon
                points={type === 'branch-down'
                    ? `${length - 6},${height - 4} ${length + 2},${height} ${length - 6},${height + 4}`
                    : `${length - 6},-4 ${length + 2},0 ${length - 6},4`
                }
                fill={color}
                transform={type === 'branch-up' ? `translate(0, ${Math.abs(height)})` : ''}
            />
        </svg>
    );
};

export default NodeConnector;
