import React from 'react';
import './ChatMessage.css';

export interface ChatMessageProps {
    content: string;
    sender: 'user' | 'bot';
    timestamp?: string;
    isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    content,
    sender,
    timestamp,
    isStreaming = false
}) => {
    return (
        <div className={`chat-message chat-message--${sender}`}>
            <div className="chat-message__bubble">
                <p className="chat-message__content">{content}</p>
                {isStreaming && (
                    <span className="chat-message__typing">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                    </span>
                )}
            </div>
            {timestamp && (
                <span className="chat-message__time">{timestamp}</span>
            )}
        </div>
    );
};

export default ChatMessage;
