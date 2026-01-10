import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatMessage from '@components/chat/ChatMessage';
import SuggestionChips from '@components/chat/SuggestionChips';
import ChatInput from '@components/chat/ChatInput';
import chatService, { StreamedMessage } from '@services/chatService';
import { ROUTES } from '@utils/constants';
import './Chat.css';

interface ChatMessageItem {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

interface LocationState {
    initialMessage?: string;
}

const Chat: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;

    const [threadId, setThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [timelineReady, setTimelineReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialMessageSent = useRef(false);

    // Scroll to bottom when messages change
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Initialize chat thread
    useEffect(() => {
        const initializeChat = async () => {
            if (isInitialized) return;

            try {
                setIsLoading(true);
                const response = await chatService.createThread();
                setThreadId(response.thread_id);
                setIsInitialized(true);
                setError(null);
            } catch (err) {
                console.error('Failed to create chat thread:', err);
                setError('Failed to start chat. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [isInitialized]);

    // Send initial message when thread is ready
    useEffect(() => {
        if (
            threadId &&
            state?.initialMessage &&
            !initialMessageSent.current &&
            isInitialized
        ) {
            initialMessageSent.current = true;
            handleSendMessage(state.initialMessage);
        }
    }, [threadId, state?.initialMessage, isInitialized]);

    // Handle streamed messages
    const handleStreamedMessage = useCallback((streamedMsg: StreamedMessage) => {
        switch (streamedMsg.type) {
            case 'chat_response':
                const botMessage: ChatMessageItem = {
                    id: `bot-${Date.now()}`,
                    content: streamedMsg.content,
                    sender: 'bot',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages((prev) => [...prev, botMessage]);
                break;

            case 'suggestions':
                setSuggestions(streamedMsg.content);
                break;

            case 'status_change':
                setTimelineReady(streamedMsg.content.timeline_ready);
                break;
        }
    }, []);

    // Send message
    const handleSendMessage = async (content: string) => {
        if (!threadId || isLoading) return;

        // Add user message immediately
        const userMessage: ChatMessageItem = {
            id: `user-${Date.now()}`,
            content,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMessage]);
        setSuggestions([]); // Clear suggestions
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
                    // On complete
                    setIsLoading(false);
                }
            );
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message. Please try again.');
            setIsLoading(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionSelect = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    // Generate timeline
    const handleGenerateTimeline = async () => {
        if (!threadId) return;

        try {
            setIsLoading(true);
            const result = await chatService.completeChat(threadId);
            // Navigate to timeline page
            navigate(ROUTES.TIMELINE.replace(':travelId', result.travelId));
        } catch (err) {
            console.error('Failed to generate timeline:', err);
            setError('Failed to generate timeline. Please try again.');
            setIsLoading(false);
        }
    };

    // Retry initialization
    const handleRetry = () => {
        setError(null);
        setIsInitialized(false);
    };

    return (
        <div className="chat-page">
            <div className="chat-page__container">
                {/* Messages Area */}
                <div className="chat-page__messages">
                    {error && (
                        <div className="chat-page__error">
                            <p>{error}</p>
                            <button onClick={handleRetry} className="chat-page__retry-btn">
                                Try Again
                            </button>
                        </div>
                    )}

                    {messages.length === 0 && !isLoading && !error && (
                        <div className="chat-page__empty">
                            <div className="chat-page__empty-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <h3>Start a conversation</h3>
                            <p>Tell us about your travel plans</p>
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
                        <ChatMessage
                            content=""
                            sender="bot"
                            isStreaming={true}
                        />
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area */}
                <div className="chat-page__input-area">
                    {suggestions.length > 0 && (
                        <SuggestionChips
                            suggestions={suggestions}
                            onSelect={handleSuggestionSelect}
                            disabled={isLoading}
                        />
                    )}

                    <ChatInput
                        onSend={handleSendMessage}
                        onGenerateTimeline={handleGenerateTimeline}
                        timelineReady={timelineReady}
                        disabled={isLoading || !threadId}
                        placeholder="Type your answer..."
                    />
                </div>
            </div>
        </div>
    );
};

export default Chat;
