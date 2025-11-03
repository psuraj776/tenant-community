/**
 * Chat Service
 * Handles real-time messaging via WebSocket
 */

import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';
import {Conversation, Message, CreateConversationInput, SendMessageInput} from '@types';

export class ChatService {
  private backend = getBackendService();
  private messageCallbacks: ((message: Message) => void)[] = [];

  async connect(token: string): Promise<void> {
    try {
      logger.info('Connecting to chat service');
      await this.backend.realtime.connect(token);
      this.setupMessageHandlers();
      logger.info('Connected to chat service');
    } catch (error) {
      logger.error('Failed to connect to chat', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.backend.realtime.disconnect();
    this.messageCallbacks = [];
    logger.info('Disconnected from chat service');
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      return await this.backend.database.query<Conversation>('conversations');
    } catch (error) {
      logger.error('Failed to get conversations', error as Error);
      throw error;
    }
  }

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    try {
      return await this.backend.database.create<Conversation>('conversations', input);
    } catch (error) {
      logger.error('Failed to create conversation', error as Error);
      throw error;
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      return await this.backend.database.query<Message>(`conversations/${conversationId}/messages`);
    } catch (error) {
      logger.error('Failed to get messages', error as Error, {conversationId});
      throw error;
    }
  }

  async sendMessage(input: SendMessageInput): Promise<void> {
    try {
      await this.backend.realtime.send('message.send', input);
    } catch (error) {
      logger.error('Failed to send message', error as Error);
      throw error;
    }
  }

  onMessage(callback: (message: Message) => void): void {
    this.messageCallbacks.push(callback);
  }

  private setupMessageHandlers(): void {
    this.backend.realtime.subscribe('message.new', (data: Message) => {
      this.messageCallbacks.forEach(cb => cb(data));
    });
  }
}

export const chatService = new ChatService();
