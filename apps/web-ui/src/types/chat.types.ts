export type MessageSender = 'user' | 'bot';

export type MessageType = 'text' | 'question' | 'suggestion' | 'timeline-generated';

export interface Message {
  id: string;
  chatSessionId: string;
  content: string;
  sender: MessageSender;
  type: MessageType;
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  travelId?: string;
  isActive: boolean;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  content: string;
  type?: MessageType;
  metadata?: {
    [key: string]: any;
  };
}

export interface ChatQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multi-select' | 'date' | 'number';
  options?: string[];
  required: boolean;
}
