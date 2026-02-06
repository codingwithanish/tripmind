import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ChatMessage from '@components/chat/ChatMessage';
import SuggestionChips from '@components/chat/SuggestionChips';
import ChatInput from '@components/chat/ChatInput';
import chatService, { StreamEventHandlers, SuggestionItem as ServiceSuggestionItem } from '@services/chatService';
import { ChatMessage as ChatMessageType } from '@/types/streamTypes';
import './Chat.css';

interface ChatMessageItem {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: string;
    type: 'text' | 'markdown';
}

interface LocationState {
    initialMessage?: string;
}

interface SuggestionChip {
    id: string;
    label: string;
    value: string;
    icon?: { provider: string; name: string };
}

const Chat: React.FC = () => {
    const { userId, threadId } = useParams<{ userId: string; threadId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;

    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [suggestions, setSuggestions] = useState<SuggestionChip[]>([]);
    const [contextProgress, setContextProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [currentStreamContent, setCurrentStreamContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialMessageSent = useRef(false);
    const hasFetchedRef = useRef(false);
    const streamContentRef = useRef(''); // Track streaming content for closure

    // Scroll to bottom when messages change
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentStreamContent, scrollToBottom]);

    // Load message history from URL params
    useEffect(() => {
        if (!userId || !threadId || hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const loadMessages = async () => {
            try {
                setIsLoading(true);
                const response = await chatService.getMessages(userId, threadId, {
                    limit: 50,
                    view: 'init-chat'
                });

                // Convert API messages to display format
                const loadedMessages: ChatMessageItem[] = response.messages.map((msg: ChatMessageType) => ({
                    id: msg.id,
                    content: msg.content,
                    sender: msg.role === 'user' ? 'user' : 'bot',
                    timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    type: msg.type as 'text' | 'markdown',
                }));

                setMessages(loadedMessages);
                setIsInitialized(true);
                setError(null);

                // Load suggestions and progress from last assistant message metadata
                const lastAssistantMsg = response.messages
                    .filter((m: ChatMessageType) => m.role === 'assistant')
                    .pop();
                if (lastAssistantMsg) {
                    // Get metadata from raw message if available
                    const msgWithMeta = lastAssistantMsg as ChatMessageType & { metadata?: { suggestions?: SuggestionChip[], progress?: number } };
                    if (msgWithMeta.metadata?.suggestions) {
                        setSuggestions(msgWithMeta.metadata.suggestions.map(s => ({
                            id: s.id,
                            label: s.label,
                            value: s.value,
                            icon: s.icon,
                        })));
                    }
                    if (typeof msgWithMeta.metadata?.progress === 'number') {
                        setContextProgress(msgWithMeta.metadata.progress);
                    }
                }
            } catch (err) {
                console.error('Failed to load messages:', err);
                setError('Failed to load chat history. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();
    }, [userId, threadId]);

    // Legacy: initialize for /chat route without params
    useEffect(() => {
        if (userId && threadId) return; // Using new URL params
        if (isInitialized) return;

        const initializeChat = async () => {
            try {
                setIsLoading(true);
                const response = await chatService.createThread();
                // Redirect to new URL format
                navigate(`/anonymous/${response.thread_id}/chat`, {
                    replace: true,
                    state: location.state
                });
            } catch (err) {
                console.error('Failed to create chat thread:', err);
                setError('Failed to start chat. Please try again.');
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [userId, threadId, isInitialized, navigate, location.state]);

    // Send initial message for legacy navigation
    useEffect(() => {
        if (
            userId &&
            threadId &&
            state?.initialMessage &&
            !initialMessageSent.current &&
            isInitialized
        ) {
            initialMessageSent.current = true;
            // Initial message already sent via /new endpoint
        }
    }, [userId, threadId, state?.initialMessage, isInitialized]);

    // Create stream event handlers
    const createStreamHandlers = (): StreamEventHandlers => ({
        onMessageStart: (_messageId) => {
            setIsStreaming(true);
            setCurrentStreamContent('');
            streamContentRef.current = ''; // Reset ref
        },
        onContentToken: (_contentId, value, _contentType) => {
            streamContentRef.current += value; // Update ref
            setCurrentStreamContent(streamContentRef.current);
        },
        onContentEnd: (_contentId) => {
            // Content block finished, ready for next
        },
        onSuggestions: (items: ServiceSuggestionItem[]) => {
            setSuggestions(items.map(s => ({
                id: s.id,
                label: s.label,
                value: s.value,
                icon: s.icon,
            })));
        },
        onPlanStatus: (_planReady, progress, _planSummary) => {
            // Update progress from plan_status event
            setContextProgress(progress);
        },
        onMessageEnd: (messageId) => {
            // Finalize the message - use ref for current content
            const finalContent = streamContentRef.current;
            setMessages(prev => [...prev, {
                id: messageId,
                content: finalContent,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'markdown',
            }]);
            streamContentRef.current = '';
            setCurrentStreamContent('');
            setIsStreaming(false);
        },
        onError: (err) => {
            console.error('Streaming error:', err);
            setError('Failed to get response. Please try again.');
            setIsStreaming(false);
            setIsLoading(false);
        },
        onComplete: () => {
            setIsLoading(false);
        },
    });

    // Send message using new streaming API
    const handleSendMessage = async (content: string) => {
        if (!userId || !threadId || isLoading) return;

        // Add user message immediately
        const userMessage: ChatMessageItem = {
            id: `user-${Date.now()}`,
            content,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
        };
        setMessages(prev => [...prev, userMessage]);
        setSuggestions([]);
        setIsLoading(true);
        setError(null);

        try {
            await chatService.streamMessage(
                userId,
                threadId,
                { role: 'user', type: 'text', content },
                createStreamHandlers(),
                { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
                { stream: true, enable_suggestions: true }
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
        if (!userId || !threadId) return;

        try {
            setIsLoading(true);
            await chatService.completeChat(threadId);
            // Navigate to new timeline URL pattern
            navigate(`/${userId}/${threadId}/timeline`);
        } catch (err) {
            console.error('Failed to generate timeline:', err);
            setError('Failed to generate timeline. Please try again.');
            setIsLoading(false);
        }
    };

    // Retry initialization
    const handleRetry = () => {
        setError(null);
        hasFetchedRef.current = false;
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
                            type={msg.type}
                        />
                    ))}

                    {/* Show streaming content */}
                    {isStreaming && currentStreamContent && (
                        <ChatMessage
                            content={currentStreamContent}
                            sender="bot"
                            type="markdown"
                        />
                    )}

                    {/* Show typing indicator when loading but not streaming yet */}
                    {isLoading && !isStreaming && messages.length > 0 && (
                        <ChatMessage
                            content=""
                            sender="bot"
                            isStreaming={true}
                            type="text"
                        />
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area */}
                <div className="chat-page__input-area">
                    {suggestions.length > 0 && (
                        <SuggestionChips
                            suggestions={suggestions.map(s => s.label)}
                            onSelect={handleSuggestionSelect}
                            disabled={isLoading}
                        />
                    )}

                    <ChatInput
                        onSend={handleSendMessage}
                        onGenerateTimeline={handleGenerateTimeline}
                        contextProgress={contextProgress}
                        disabled={isLoading || (!userId && !threadId)}
                        placeholder="Type your answer..."
                    />
                </div>
            </div>
        </div>
    );
};

export default Chat;
