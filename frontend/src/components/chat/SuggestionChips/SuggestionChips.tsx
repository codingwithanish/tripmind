import React, { useRef } from 'react';
import './SuggestionChips.css';

export interface SuggestionChipsProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    disabled?: boolean;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({
    suggestions,
    onSelect,
    disabled = false
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
        }
    };

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="suggestion-chips">
            <button
                className="suggestion-chips__nav suggestion-chips__nav--left"
                onClick={scrollLeft}
                aria-label="Scroll left"
                type="button"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <div className="suggestion-chips__container" ref={scrollContainerRef}>
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        className="suggestion-chips__chip"
                        onClick={() => onSelect(suggestion)}
                        disabled={disabled}
                        type="button"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>

            <button
                className="suggestion-chips__nav suggestion-chips__nav--right"
                onClick={scrollRight}
                aria-label="Scroll right"
                type="button"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    );
};

export default SuggestionChips;
