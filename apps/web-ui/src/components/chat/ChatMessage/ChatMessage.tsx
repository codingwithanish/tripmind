import React from 'react';
import MarkdownRenderer from '@components/common/MarkdownRenderer';
import './ChatMessage.css';

export interface ChatMessageProps {
    content: string;
    sender: 'user' | 'bot';
    timestamp?: string;
    isStreaming?: boolean;
    /** Content type: 'text' for plain text, 'markdown' for markdown rendering */
    type?: 'text' | 'markdown';
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    content,
    sender,
    timestamp,
    isStreaming = false,
    type = 'text'
}) => {
    const renderContent = () => {
        if (type === 'markdown') {
            return <MarkdownRenderer content={content} />;
        }
        return <p className="chat-message__content">{content}</p>;
    };

    return (
        <div className={`chat-message chat-message--${sender}`}>
            <div className="chat-message__bubble">
                {renderContent()}
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
