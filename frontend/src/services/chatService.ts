import api from './api';
import { ChatSession, Message, SendMessageData } from '@types/chat.types';
import { ApiResponse } from '@types/api.types';

// Streaming response types as per API spec
export interface ChatResponseMessage {
  type: 'chat_response';
  content: string;
  timeline_context_collected?: number; // 0-100, represents context collection progress
}

export interface SuggestionsMessage {
  type: 'suggestions';
  content: string[];
}

// Note: status_change type removed - timeline readiness now comes via timeline_context_collected

export type StreamedMessage = ChatResponseMessage | SuggestionsMessage;

export interface ThreadResponse {
  thread_id: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const chatService = {
  // Create new chat thread (as per spec: POST /api/chat/threads)
  createThread: async (): Promise<ThreadResponse> => {
    const response = await api.post<ApiResponse<ThreadResponse>>('/chat/threads');
    return response.data.data!;
  },

  // Create new chat session (legacy)
  createSession: async (): Promise<ChatSession> => {
    const response = await api.post<ApiResponse<ChatSession>>('/chat');
    return response.data.data!;
  },

  // Get chat session by ID
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await api.get<ApiResponse<ChatSession>>(`/chat/${sessionId}`);
    return response.data.data!;
  },

  // Send message in chat session (legacy)
  sendMessage: async (sessionId: string, data: SendMessageData): Promise<Message> => {
    const response = await api.post<ApiResponse<Message>>(`/chat/${sessionId}/messages`, data);
    return response.data.data!;
  },

  // Send conversation message with streaming support
  // POST /api/chat/{thread_id}/conversations
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
          // Process any remaining buffer
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

        // Process complete JSON objects (newline-delimited)
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
