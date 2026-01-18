import React, { useState, KeyboardEvent } from 'react';
import './ChatInput.css';

export interface ChatInputProps {
    onSend: (message: string) => void;
    onGenerateTimeline?: () => void;
    contextProgress?: number; // 0-100: timeline_context_collected value
    disabled?: boolean;
    placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    onGenerateTimeline,
    contextProgress = 0,
    disabled = false,
    placeholder = 'Type your message...'
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
                    {/* Planning button - always visible */}
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
                        {/* Icon inside */}
                        <svg
                            className="chat-input__planning-icon"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </button>

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

