import React, { useState, useCallback, useRef, useEffect } from 'react';
import ChatMessage from '@components/chat/ChatMessage';
import SuggestionChips from '@components/chat/SuggestionChips';
import ChatInput from '@components/chat/ChatInput';
import ActionCardMessage from '@components/chat/ActionCardMessage';
import chatService, { StreamedMessage } from '@services/chatService';
import type { TimelineNode } from '../../../types/websocket.types';
import './TimelineChat.css';

interface ChatMessageItem {
    id: string;
    type: 'text' | 'action_card';
    content?: string;
    node?: TimelineNode;
    sender: 'user' | 'bot' | 'context';
    timestamp: string;
    helpContext?: Record<string, unknown>;
}

export interface TimelineChatProps {
    threadId: string | null;
    contextCard?: TimelineNode | null;
    onContextCardHandled?: () => void;
    onTimelineUpdate?: () => void;
}

const TimelineChat: React.FC<TimelineChatProps> = ({
    threadId,
    contextCard,
    onContextCardHandled,
    onTimelineUpdate
}) => {
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [contextProgress, setContextProgress] = useState(100); // Already at 100% on timeline page
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Track the current help context for the next message
    const [pendingHelpContext, setPendingHelpContext] = useState<Record<string, unknown> | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastContextCardId = useRef<string | null>(null);
    const hasLoadedMessages = useRef(false);

    // Scroll to bottom when messages change
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Load persisted messages on mount
    useEffect(() => {
        if (!threadId || hasLoadedMessages.current) return;

        const loadMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const response = await chatService.getTimelineMessages(threadId, { limit: 50 });

                if (response.messages && response.messages.length > 0) {
                    const loadedMessages: ChatMessageItem[] = [];

                    for (const msg of response.messages) {
                        // If message has help_context, add an action card first
                        if (msg.help_context && msg.role === 'user') {
                            const helpCtx = msg.help_context as { node?: TimelineNode };
                            if (helpCtx.node) {
                                loadedMessages.push({
                                    id: `context-${msg.id}`,
                                    type: 'action_card',
                                    node: helpCtx.node,
                                    sender: 'context',
                                    timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }),
                                });
                            }
                        }

                        // Add the message itself
                        loadedMessages.push({
                            id: msg.id,
                            type: 'text',
                            content: msg.content,
                            sender: msg.role === 'user' ? 'user' : 'bot',
                            timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            }),
                        });
                    }

                    setMessages(loadedMessages);
                }
                hasLoadedMessages.current = true;
            } catch (err) {
                console.error('Error loading timeline messages:', err);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        loadMessages();
    }, [threadId]);

    // Handle context card changes - add card to messages when new card arrives
    useEffect(() => {
        if (contextCard && contextCard.id !== lastContextCardId.current) {
            lastContextCardId.current = contextCard.id;

            const cardMessage: ChatMessageItem = {
                id: `context-${Date.now()}`,
                type: 'action_card',
                node: contextCard,
                sender: 'context',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages(prev => [...prev, cardMessage]);
            setSuggestions([
                'What are my options for this?',
                'Can you find cheaper alternatives?',
                'What should I know before booking?',
            ]);

            // Set pending help context for the next message
            setPendingHelpContext({ node: contextCard });

            // Notify parent that we've handled the context card
            onContextCardHandled?.();
        }
    }, [contextCard, onContextCardHandled]);

    // Handle streamed messages
    const handleStreamedMessage = useCallback((streamedMsg: StreamedMessage) => {
        switch (streamedMsg.type) {
            case 'chat_response':
                const botMessage: ChatMessageItem = {
                    id: `bot-${Date.now()}-${Math.random()}`,
                    type: 'text',
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

    // Send message using timeline conversation API
    const handleSendMessage = async (content: string) => {
        if (!threadId || isLoading) return;

        const userMessage: ChatMessageItem = {
            id: `user-${Date.now()}`,
            type: 'text',
            content,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            helpContext: pendingHelpContext || undefined,
        };
        setMessages((prev) => [...prev, userMessage]);
        setSuggestions([]);
        setIsLoading(true);
        setError(null);

        // Capture help context for this message
        const helpContextForMessage = pendingHelpContext;
        // Clear pending help context after capturing
        setPendingHelpContext(null);

        try {
            // Use the new timeline-specific API
            await chatService.sendTimelineConversation(
                threadId,
                content,
                helpContextForMessage || undefined,
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

    const hasContent = messages.length > 0 || error;

    return (
        <div className="timeline-chat">
            <div className="timeline-chat__header">
                <h3>Refine Your Plan</h3>
                <p>Add more details to improve your timeline</p>
            </div>

            <div className="timeline-chat__messages">
                {isLoadingMessages && (
                    <div className="timeline-chat__loading">
                        <p>Loading messages...</p>
                    </div>
                )}

                {!hasContent && !isLoadingMessages && (
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
                    msg.type === 'action_card' && msg.node ? (
                        <ActionCardMessage key={msg.id} node={msg.node} />
                    ) : (
                        <ChatMessage
                            key={msg.id}
                            content={msg.content || ''}
                            sender={msg.sender === 'context' ? 'bot' : msg.sender}
                            timestamp={msg.timestamp}
                        />
                    )
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
                    disabled={isLoading || !threadId || isLoadingMessages}
                    placeholder="Ask a question or add details..."
                    showPlanningButton={false}
                />
            </div>
        </div>
    );
};

export default TimelineChat;
