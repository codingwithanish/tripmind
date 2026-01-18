// DateBadge Component - Small pill showing the date
// Positioned between the node marker and task cards

import { useNode, useTimeline } from '../TimelineContext';

interface DateBadgeProps {
    className?: string;
}

export function DateBadge({ className = '' }: DateBadgeProps) {
    const { node } = useNode();
    const { style } = useTimeline();

    // Only show date badge if node has a display date
    if (!node.display_date?.label) {
        return null;
    }

    const nodeSize = node.type === 'start' || node.type === 'end'
        ? style.node.size.start
        : style.node.size.default;

    return (
        <div
            className={`timeline-date-badge ${className}`.trim()}
            style={{
                position: 'absolute',
                left: style.spine.x + nodeSize + style.spacing.dateBadgeDistance,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                zIndex: 5,
            }}
        >
            {node.display_date.label}
        </div>
    );
}

export default DateBadge;
