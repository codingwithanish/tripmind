import React, { useState, useCallback, useRef, useEffect } from 'react';
import ChatMessage from '@components/chat/ChatMessage';
import SuggestionChips from '@components/chat/SuggestionChips';
import ChatInput from '@components/chat/ChatInput';
import chatService, { StreamedMessage } from '@services/chatService';
import './TimelineChat.css';

interface ChatMessageItem {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

export interface TimelineChatProps {
    threadId: string | null;
    onTimelineUpdate?: () => void;
}

const TimelineChat: React.FC<TimelineChatProps> = ({ threadId, onTimelineUpdate }) => {
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [contextProgress, setContextProgress] = useState(100); // Already at 100% on timeline page
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Handle streamed messages
    const handleStreamedMessage = useCallback((streamedMsg: StreamedMessage) => {
        switch (streamedMsg.type) {
            case 'chat_response':
                const botMessage: ChatMessageItem = {
                    id: `bot-${Date.now()}-${Math.random()}`,
                    content: streamedMsg.content,
                    sender: 'bot',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages((prev) => [...prev, botMessage]);

                if (streamedMsg.timeline_context_collected !== undefined) {
                    setContextProgress((prev) =>
                        Math.max(prev, streamedMsg.timeline_context_collected!)
                    );
                }
                break;

            case 'suggestions':
                setSuggestions(streamedMsg.content);
                break;
        }
    }, []);

    // Send message
    const handleSendMessage = async (content: string) => {
        if (!threadId || isLoading) return;

        const userMessage: ChatMessageItem = {
            id: `user-${Date.now()}`,
            content,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMessage]);
        setSuggestions([]);
        setIsLoading(true);
        setError(null);

        try {
            await chatService.sendConversation(
                threadId,
                content,
                handleStreamedMessage,
                (err) => {
                    console.error('Streaming error:', err);
                    setError('Failed to get response. Please try again.');
                },
                () => {
                    setIsLoading(false);
                    onTimelineUpdate?.();
                }
            );
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSuggestionSelect = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    return (
        <div className="timeline-chat">
            <div className="timeline-chat__header">
                <h3>Refine Your Plan</h3>
                <p>Add more details to improve your timeline</p>
            </div>

            <div className="timeline-chat__messages">
                {messages.length === 0 && !error && (
                    <div className="timeline-chat__empty">
                        <p>Ask questions or provide more details to refine your travel plan.</p>
                    </div>
                )}

                {error && (
                    <div className="timeline-chat__error">
                        <p>{error}</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        content={msg.content}
                        sender={msg.sender}
                        timestamp={msg.timestamp}
                    />
                ))}

                {isLoading && messages.length > 0 && (
                    <ChatMessage content="" sender="bot" isStreaming={true} />
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="timeline-chat__input-area">
                {suggestions.length > 0 && (
                    <SuggestionChips
                        suggestions={suggestions}
                        onSelect={handleSuggestionSelect}
                        disabled={isLoading}
                    />
                )}

                <ChatInput
                    onSend={handleSendMessage}
                    contextProgress={contextProgress}
                    disabled={isLoading || !threadId}
                    placeholder="Ask a question or add details..."
                />
            </div>
        </div>
    );
};

export default TimelineChat;
