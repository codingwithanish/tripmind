// Streaming event types as per API spec
export interface MessageStartEvent {
    event: 'message.start';
    message_id: string;
    role: 'assistant';
}

export interface ContentStartEvent {
    event: 'content.start';
    content_id: string;
    content_type: 'text' | 'markdown' | 'image' | 'card' | 'error';
}

export interface ContentTokenEvent {
    event: 'content.token';
    content_id: string;
    content_type: 'text' | 'markdown';
    value: string;
}

export interface ContentDataEvent {
    event: 'content.data';
    content_id: string;
    content_type: 'image' | 'card';
    url?: string;
    data?: unknown;
}

export interface ContentEndEvent {
    event: 'content.end';
    content_id: string;
}

export interface SuggestionsEvent {
    event: 'suggestions';
    items: SuggestionItem[];
}

export interface MessageEndEvent {
    event: 'message.end';
    message_id: string;
}

export interface SuggestionItem {
    id: string;
    type?: string;
    label: string;
    icon?: {
        provider: string;
        name: string;
    };
    value: string;
    payload?: Record<string, unknown>;
}

export type StreamEvent =
    | MessageStartEvent
    | ContentStartEvent
    | ContentTokenEvent
    | ContentDataEvent
    | ContentEndEvent
    | SuggestionsEvent
    | MessageEndEvent;

// Message types for display
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    sender_id: string;
    type: 'text' | 'markdown';
    content: string;
    created_at: string;
    status: string;
}

// Stream request types
export interface StreamInput {
    role: 'user';
    type: 'text' | 'markdown';
    content: string;
}

export interface StreamContext {
    timezone?: string;
    locale?: string;
}

export interface StreamOptions {
    stream?: boolean;
    enable_suggestions?: boolean;
}

export interface StreamRequest {
    thread_id: string;
    user_id: string;
    input: StreamInput;
    context?: StreamContext;
    options?: StreamOptions;
}

// Suggestions response
export interface SuggestionsResponse {
    thread_id: string;
    user_id: string;
    suggestions: SuggestionItem[];
    expires_at: string;
}

// Messages response
export interface MessagesResponse {
    messages: ChatMessage[];
    next_cursor: string | null;
    view?: string;
}

// New chat response
export interface NewChatResponse {
    thread_id: string;
    user_id: string;
    status: string;
    initial_response?: {
        message_id: string;
        content: string;
        type: string;
    };
}
