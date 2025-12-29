import { create } from 'zustand';
import { generateId } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  createdAt: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: unknown;
}

interface ChatState {
  messages: Message[];
  sessionId: string;
  isConnected: boolean;
  isTyping: boolean;

  // Actions
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  appendToMessage: (id: string, content: string) => void;
  setSessionId: (id: string) => void;
  setIsConnected: (connected: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  clearMessages: () => void;
  resetSession: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: generateId(),
  isConnected: false,
  isTyping: false,

  addMessage: (message) => {
    const id = generateId();
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id,
          createdAt: new Date(),
        },
      ],
    }));
    return id;
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  appendToMessage: (id, content) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + content } : msg
      ),
    }));
  },

  setSessionId: (id) => set({ sessionId: id }),

  setIsConnected: (connected) => set({ isConnected: connected }),

  setIsTyping: (typing) => set({ isTyping: typing }),

  clearMessages: () => set({ messages: [] }),

  resetSession: () =>
    set({
      messages: [],
      sessionId: generateId(),
      isTyping: false,
    }),
}));
