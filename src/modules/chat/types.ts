/**
 * Chat Module Types
 */

import {Conversation, Message} from '@types';

export interface ChatState {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Record<string, Message[]>;
  typing: Record<string, boolean>;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

export interface TypingStatus {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}
