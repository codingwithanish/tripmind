// Content Component - Wrapper for card content with slide-in animation

import { useRef, useEffect, useState } from 'react';
import { useNode, useTimeline } from '../TimelineContext';

interface ContentProps {
    children?: React.ReactNode;
    className?: string;
}

export function Content({ children, className = '' }: ContentProps) {
    const { style } = useTimeline();
    const { isBlocking } = useNode();
    const contentRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger slide-in animation after mount
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            ref={contentRef}
            className={`timeline-content ${isVisible ? 'timeline-content--visible' : ''} ${className}`.trim()}
            style={{
                position: 'absolute',
                left: style.spacing.cardDistance,
                top: '50%',
                transform: 'translateY(-50%)',
                width: style.card.width,
                opacity: isVisible ? 1 : 0,
                transition: `opacity ${style.animation.duration}ms ease-out, transform ${style.animation.duration}ms ease-out`,
                // Slide in from left
                ...(isVisible ? {} : { transform: 'translateY(-50%) translateX(-20px)' }),
            }}
        >
            {children}
        </div>
    );
}

export default Content;
