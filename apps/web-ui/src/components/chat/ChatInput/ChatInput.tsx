import React, { useState, KeyboardEvent } from 'react';
import './ChatInput.css';

export interface ChatInputProps {
    onSend: (message: string) => void;
    onGenerateTimeline?: () => void;
    contextProgress?: number; // 0-100: timeline_context_collected value
    disabled?: boolean;
    placeholder?: string;
    showPlanningButton?: boolean; // Whether to show the timeline planning button
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    onGenerateTimeline,
    contextProgress = 0,
    disabled = false,
    placeholder = 'Type your message...',
    showPlanningButton = true
}) => {
    const [message, setMessage] = useState('');
    const isReady = contextProgress >= 100;

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handlePlanningClick = () => {
        if (isReady && onGenerateTimeline) {
            onGenerateTimeline();
        }
    };

    return (
        <div className="chat-input">
            <div className="chat-input__container">
                {/* Timeline button - LEFT SIDE */}
                {showPlanningButton && (
                    <button
                        type="button"
                        className={`chat-input__planning-btn ${isReady ? 'chat-input__planning-btn--ready' : ''}`}
                        onClick={handlePlanningClick}
                        disabled={!isReady || disabled}
                        aria-label="Generate Travel Timeline"
                        title={isReady ? 'Generate your travel timeline' : `Collecting context... ${contextProgress}%`}
                    >
                        {/* Progress ring SVG */}
                        <svg
                            className="chat-input__progress-ring"
                            width="48"
                            height="48"
                            viewBox="0 0 48 48"
                        >
                            {/* Background circle */}
                            <circle
                                className="chat-input__progress-ring-bg"
                                cx="24"
                                cy="24"
                                r="20"
                                fill="none"
                                strokeWidth="3"
                            />
                            {/* Progress circle */}
                            <circle
                                className="chat-input__progress-ring-progress"
                                cx="24"
                                cy="24"
                                r="20"
                                fill="none"
                                strokeWidth="3"
                                strokeDasharray={`${2 * Math.PI * 20}`}
                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - contextProgress / 100)}`}
                                transform="rotate(-90 24 24)"
                            />
                        </svg>
                        {/* mdi:timeline-check icon */}
                        <svg
                            className="chat-input__planning-icon"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M21.04 12.13C21.18 12.13 21.31 12.19 21.42 12.3L22.7 13.58C22.92 13.79 22.92 14.14 22.7 14.35L21.7 15.35L19.65 13.3L20.65 12.3C20.76 12.19 20.9 12.13 21.04 12.13M19.07 13.88L21.12 15.93L15.06 22H13V19.94L19.07 13.88M11 19L11 13H4V19H11M11 11V5H4V11H11M13 5V11H20V5H13M20 9H13V7H20V9Z" />
                        </svg>
                    </button>
                )}

                <input
                    type="text"
                    className="chat-input__field"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-label="Chat message input"
                />

                <div className="chat-input__actions">
                    <button
                        type="button"
                        className="chat-input__send-btn"
                        onClick={handleSend}
                        disabled={disabled || !message.trim()}
                        aria-label="Send message"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
