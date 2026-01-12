import React from 'react';
import './BranchConnector.css';

export interface BranchConnectorProps {
    elementCount: number;
    elementHeight?: number;
    color?: string;
}

/**
 * SVG-based branching connector that draws arrows from a single point
 * to multiple elements, matching the reference wireframe design.
 * 
 * The connector starts at the node marker position and branches to each card.
 */
const BranchConnector: React.FC<BranchConnectorProps> = ({
    elementCount,
    elementHeight = 90,
    color = '#3b82f6',
}) => {
    if (elementCount === 0) return null;

    // Origin point - at the node marker (12px = half of 24px marker diameter)
    const originY = 12;
    const originX = 12; // Start from right edge of node marker area
    const endX = 72;    // End point (touching the card)
    const branchX = 32; // Where the vertical branch line is

    // Calculate Y position for each element (centered in their 90px row)
    const getElementY = (index: number) => 45 + (index * elementHeight);

    const totalHeight = Math.max(90, elementCount * elementHeight);

    // For single element, draw a curved line from origin to element center
    if (elementCount === 1) {
        const targetY = 45; // Center of 90px card row
        return (
            <svg
                className="branch-connector"
                width={endX + 10}
                height={totalHeight}
                viewBox={`0 0 ${endX + 10} ${totalHeight}`}
            >
                {/* Curved path from origin (node marker) to element center */}
                <path
                    d={`M ${originX} ${originY} 
                        Q ${branchX} ${originY}, 
                          ${branchX} ${(originY + targetY) / 2}
                        Q ${branchX} ${targetY},
                          ${endX} ${targetY}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                />
                {/* Arrow head */}
                <polygon
                    points={`${endX - 6},${targetY - 4} ${endX + 2},${targetY} ${endX - 6},${targetY + 4}`}
                    fill={color}
                />
            </svg>
        );
    }

    // For multiple elements, draw branching structure
    const elementYs = Array.from({ length: elementCount }, (_, i) => getElementY(i));
    const maxY = elementYs[elementYs.length - 1];

    return (
        <svg
            className="branch-connector"
            width={endX + 10}
            height={maxY + 45}
            viewBox={`0 0 ${endX + 10} ${maxY + 45}`}
        >
            {/* Horizontal line from origin to branch point */}
            <line
                x1={originX}
                y1={originY}
                x2={branchX}
                y2={originY}
                stroke={color}
                strokeWidth="2"
            />

            {/* Vertical line from origin down to last element */}
            <line
                x1={branchX}
                y1={originY}
                x2={branchX}
                y2={maxY}
                stroke={color}
                strokeWidth="2"
            />

            {/* Branches to each element */}
            {elementYs.map((y, index) => (
                <g key={index}>
                    <line
                        x1={branchX}
                        y1={y}
                        x2={endX}
                        y2={y}
                        stroke={color}
                        strokeWidth="2"
                    />
                    <polygon
                        points={`${endX - 6},${y - 4} ${endX + 2},${y} ${endX - 6},${y + 4}`}
                        fill={color}
                    />
                </g>
            ))}
        </svg>
    );
};

export default BranchConnector;
