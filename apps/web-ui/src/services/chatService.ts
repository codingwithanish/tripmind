import api from './api';
import { ChatSession, Message, SendMessageData } from '../types/chat.types';
import { ApiResponse } from '../types/api.types';
import {
  StreamEvent,
  StreamInput,
  StreamContext,
  StreamOptions,
  ChatMessage,
  MessagesResponse,
  NewChatResponse,
  SuggestionItem,
} from '../types/streamTypes';

// Legacy streaming response types (kept for backward compatibility)
export interface ChatResponseMessage {
  type: 'chat_response';
  content: string;
  timeline_context_collected?: number;
}

export interface SuggestionsMessage {
  type: 'suggestions';
  content: string[];
}

export type StreamedMessage = ChatResponseMessage | SuggestionsMessage;

export interface ThreadResponse {
  thread_id: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Stream event handlers
export interface StreamEventHandlers {
  onMessageStart?: (messageId: string) => void;
  onContentStart?: (contentId: string, contentType: string) => void;
  onContentToken?: (contentId: string, value: string, contentType: string) => void;
  onContentData?: (contentId: string, contentType: string, data: unknown) => void;
  onContentEnd?: (contentId: string) => void;
  onSuggestions?: (items: SuggestionItem[]) => void;
  onPlanStatus?: (planReady: boolean, progress: number, planSummary: string) => void;
  onMessageEnd?: (messageId: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

const chatService = {
  // Create new chat with initial message (NEW API)
  // POST /api/v1/chat/new
  createNewChat: async (message: string): Promise<NewChatResponse> => {
    const response = await api.post<ApiResponse<NewChatResponse>>('/chat/new', { message });
    return response.data.data!;
  },

  // Create new chat thread (legacy)
  createThread: async (): Promise<ThreadResponse> => {
    const response = await api.post<ApiResponse<ThreadResponse>>('/chat/threads');
    return response.data.data!;
  },

  // Get message history with pagination
  // GET /api/v1/chat/:userId/:threadId/messages
  getMessages: async (
    userId: string,
    threadId: string,
    options?: { limit?: number; before?: string; view?: string }
  ): Promise<MessagesResponse> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.before) params.append('before', options.before);
    if (options?.view) params.append('view', options.view);

    const queryString = params.toString();
    const url = `/chat/${userId}/${threadId}/messages${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<MessagesResponse>(url);
    return response.data;
  },



  // Stream chat message with event-based protocol
  // POST /api/v1/chat/:userId/:threadId/stream
  streamMessage: async (
    userId: string,
    threadId: string,
    input: StreamInput,
    handlers: StreamEventHandlers,
    context?: StreamContext,
    options?: StreamOptions
  ): Promise<void> => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/chat/${userId}/${threadId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          thread_id: threadId,
          user_id: userId,
          input,
          context,
          options: { stream: true, enable_suggestions: true, ...options },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const event = JSON.parse(buffer.trim()) as StreamEvent;
              chatService.handleStreamEvent(event, handlers);
            } catch {
              // Ignore incomplete JSON
            }
          }
          handlers.onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete JSON objects (newline-delimited)
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const event = JSON.parse(line.trim()) as StreamEvent;
              chatService.handleStreamEvent(event, handlers);
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      handlers.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  },

  // Handle individual stream events
  handleStreamEvent: (event: StreamEvent, handlers: StreamEventHandlers) => {
    switch (event.event) {
      case 'message.start':
        handlers.onMessageStart?.(event.message_id);
        break;
      case 'content.start':
        handlers.onContentStart?.(event.content_id, event.content_type);
        break;
      case 'content.token':
        handlers.onContentToken?.(event.content_id, event.value, event.content_type);
        break;
      case 'content.data':
        handlers.onContentData?.(event.content_id, event.content_type, event.url || event.data);
        break;
      case 'content.end':
        handlers.onContentEnd?.(event.content_id);
        break;
      case 'suggestions':
        handlers.onSuggestions?.(event.items);
        break;
      case 'plan_status':
        handlers.onPlanStatus?.(event.plan_ready, event.progress, event.plan_summary);
        break;
      case 'message.end':
        handlers.onMessageEnd?.(event.message_id);
        break;
    }
  },

  // Legacy: Create new chat session
  createSession: async (): Promise<ChatSession> => {
    const response = await api.post<ApiResponse<ChatSession>>('/chat');
    return response.data.data!;
  },

  // Legacy: Get chat session by ID
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await api.get<ApiResponse<ChatSession>>(`/chat/${sessionId}`);
    return response.data.data!;
  },

  // Legacy: Send message in chat session
  sendMessage: async (sessionId: string, data: SendMessageData): Promise<Message> => {
    const response = await api.post<ApiResponse<Message>>(`/chat/${sessionId}/messages`, data);
    return response.data.data!;
  },

  // Legacy: Send conversation message with streaming support
  sendConversation: async (
    threadId: string,
    message: string,
    onMessage: (message: StreamedMessage) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/chat/${threadId}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer.trim());
              onMessage(parsed);
            } catch {
              // Ignore incomplete JSON
            }
          }
          onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line.trim());
              onMessage(parsed);
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  },

  // Complete chat and generate timeline
  completeChat: async (sessionId: string): Promise<{ travelId: string; timelineId: string }> => {
    const response = await api.post<ApiResponse<{ travelId: string; timelineId: string }>>(
      `/chat/${sessionId}/complete`
    );
    return response.data.data!;
  },
};

export default chatService;

// Re-export types for convenience
export type { ChatMessage, SuggestionItem, StreamEvent };
