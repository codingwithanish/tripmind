import React, { useState, KeyboardEvent } from 'react';
import './ChatInput.css';

export interface ChatInputProps {
    onSend: (message: string) => void;
    onGenerateTimeline?: () => void;
    timelineReady?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    onGenerateTimeline,
    timelineReady = false,
    disabled = false,
    placeholder = 'Type your message...'
}) => {
    const [message, setMessage] = useState('');

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
                    {timelineReady && onGenerateTimeline && (
                        <button
                            type="button"
                            className="chat-input__timeline-btn"
                            onClick={onGenerateTimeline}
                            disabled={disabled}
                            aria-label="Generate Travel Timeline"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Generate Timeline</span>
                        </button>
                    )}

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
