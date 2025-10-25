/**
 * Backend service interfaces
 * These interfaces define the contract for backend operations
 * Supporting both Firebase and Custom backend implementations
 */

import {
  AuthResult,
  TokenPair,
  OTPRequestInput,
  OTPVerifyInput,
  UploadResult,
  PresignedUploadUrl,
} from '@types';

// ============================================================================
// Main Backend Service Interface
// ============================================================================

export interface IBackendService {
  auth: IAuthService;
  database: IDatabaseService;
  storage: IStorageService;
  realtime: IRealtimeService;
}

// ============================================================================
// Auth Service Interface
// ============================================================================

export interface IAuthService {
  /**
   * Request OTP for phone number
   */
  requestOTP(input: OTPRequestInput): Promise<void>;

  /**
   * Verify OTP and get auth tokens
   */
  verifyOTP(input: OTPVerifyInput): Promise<AuthResult>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string): Promise<TokenPair>;

  /**
   * Logout and revoke tokens
   */
  logout(): Promise<void>;

  /**
   * Get current user ID
   */
  getCurrentUserId(): Promise<string | null>;
}

// ============================================================================
// Database Service Interface
// ============================================================================

export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'array-contains';
  value: any;
}

export interface QueryOptions {
  orderBy?: {field: string; direction: 'asc' | 'desc'};
  limit?: number;
  offset?: number;
}

export interface IDatabaseService {
  /**
   * Query collection with filters
   */
  query<T>(
    collection: string,
    filters?: QueryFilter[],
    options?: QueryOptions,
  ): Promise<T[]>;

  /**
   * Get document by ID
   */
  getById<T>(collection: string, id: string): Promise<T | null>;

  /**
   * Create new document
   */
  create<T>(collection: string, data: Omit<T, 'id'>): Promise<T>;

  /**
   * Update document
   */
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete document
   */
  delete(collection: string, id: string): Promise<void>;

  /**
   * Batch operations
   */
  batchWrite(operations: BatchOperation[]): Promise<void>;
}

export interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  collection: string;
  id?: string;
  data?: any;
}

// ============================================================================
// Storage Service Interface
// ============================================================================

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

export interface IStorageService {
  /**
   * Get presigned URL for upload (for custom backend)
   */
  getPresignedUploadUrl(path: string): Promise<PresignedUploadUrl>;

  /**
   * Upload file directly (for Firebase)
   */
  uploadFile(file: File | Blob, path: string, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Get download URL for a file
   */
  getDownloadURL(path: string): Promise<string>;

  /**
   * Delete file
   */
  deleteFile(path: string): Promise<void>;
}

// ============================================================================
// Realtime Service Interface (Chat/WebSocket)
// ============================================================================

export type MessageCallback = (data: any) => void;
export type ErrorCallback = (error: Error) => void;

export interface IRealtimeService {
  /**
   * Connect to realtime service
   */
  connect(token: string): Promise<void>;

  /**
   * Disconnect from realtime service
   */
  disconnect(): Promise<void>;

  /**
   * Subscribe to channel/topic
   */
  subscribe(channel: string, callback: MessageCallback): void;

  /**
   * Unsubscribe from channel/topic
   */
  unsubscribe(channel: string): void;

  /**
   * Send message to channel
   */
  send(channel: string, data: any): Promise<void>;

  /**
   * Check connection status
   */
  isConnected(): boolean;

  /**
   * Set error handler
   */
  onError(callback: ErrorCallback): void;

  /**
   * Set connection status handler
   */
  onConnectionChange(callback: (connected: boolean) => void): void;
}

// ============================================================================
// File Helper Interface
// ============================================================================

export interface File {
  uri: string;
  name: string;
  type: string;
  size?: number;
}
