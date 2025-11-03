/**
 * Custom Backend Service Implementation
 * REST API + WebSocket based backend
 */

import {
  IBackendService,
  IAuthService,
  IDatabaseService,
  IStorageService,
  IRealtimeService,
  QueryFilter,
  QueryOptions,
  BatchOperation,
  UploadOptions,
  File,
  PresignedUploadUrl,
} from './interfaces';
import {
  AuthResult,
  TokenPair,
  OTPRequestInput,
  OTPVerifyInput,
  UploadResult,
} from '@types';
import axios, {AxiosInstance} from 'axios';
import {io, Socket} from 'socket.io-client';

// ============================================================================
// Custom Backend Service
// ============================================================================

export class CustomBackendService implements IBackendService {
  public auth: IAuthService;
  public database: IDatabaseService;
  public storage: IStorageService;
  public realtime: IRealtimeService;

  constructor(config: {baseURL: string; wsURL: string}) {
    const apiClient = this.createApiClient(config.baseURL);

    this.auth = new CustomAuthService(apiClient);
    this.database = new CustomDatabaseService(apiClient);
    this.storage = new CustomStorageService(apiClient);
    this.realtime = new WebSocketService(config.wsURL);
  }

  private createApiClient(baseURL: string): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    client.interceptors.request.use(
      async config => {
        const token = await this.auth.getCurrentToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Response interceptor for error handling and token refresh
    client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await this.auth.getRefreshToken();
            if (refreshToken) {
              const {accessToken} = await this.auth.refreshToken(refreshToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.auth.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return client;
  }
}

// ============================================================================
// Custom Auth Service
// ============================================================================

class CustomAuthService implements IAuthService {
  private apiClient: AxiosInstance;
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;

  constructor(apiClient: AxiosInstance) {
    this.apiClient = apiClient;
  }

  async requestOTP(input: OTPRequestInput): Promise<void> {
    await this.apiClient.post('/auth/otp/request', input);
  }

  async verifyOTP(input: OTPVerifyInput): Promise<AuthResult> {
    const response = await this.apiClient.post<AuthResult>('/auth/otp/verify', input);
    const {accessToken, refreshToken} = response.data;

    this.accessToken = accessToken;
    this.refreshTokenValue = refreshToken;

    // Store tokens securely (implementation depends on storage service)
    // For now, just in memory
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const response = await this.apiClient.post<TokenPair>('/auth/refresh', {
      refreshToken,
    });

    this.accessToken = response.data.accessToken;
    this.refreshTokenValue = response.data.refreshToken;

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout');
    } finally {
      this.accessToken = null;
      this.refreshTokenValue = null;
    }
  }

  async getCurrentUserId(): Promise<string | null> {
    if (!this.accessToken) return null;

    try {
      const response = await this.apiClient.get('/me');
      return response.data.id;
    } catch {
      return null;
    }
  }

  async getCurrentToken(): Promise<string | null> {
    return this.accessToken;
  }

  async getRefreshToken(): Promise<string | null> {
    return this.refreshTokenValue;
  }
}

// ============================================================================
// Custom Database Service
// ============================================================================

class CustomDatabaseService implements IDatabaseService {
  private apiClient: AxiosInstance;

  constructor(apiClient: AxiosInstance) {
    this.apiClient = apiClient;
  }

  async query<T>(
    collection: string,
    filters?: QueryFilter[],
    options?: QueryOptions,
  ): Promise<T[]> {
    const params: any = {};

    if (filters) {
      params.filters = JSON.stringify(filters);
    }

    if (options?.orderBy) {
      params.orderBy = options.orderBy.field;
      params.orderDirection = options.orderBy.direction;
    }

    if (options?.limit) {
      params.limit = options.limit;
    }

    if (options?.offset) {
      params.offset = options.offset;
    }

    const response = await this.apiClient.get(`/${collection}`, {params});
    return response.data.items || response.data;
  }

  async getById<T>(collection: string, id: string): Promise<T | null> {
    try {
      const response = await this.apiClient.get(`/${collection}/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create<T>(collection: string, data: Omit<T, 'id'>): Promise<T> {
    const response = await this.apiClient.post(`/${collection}`, data);
    return response.data;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const response = await this.apiClient.patch(`/${collection}/${id}`, data);
    return response.data;
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.apiClient.delete(`/${collection}/${id}`);
  }

  async batchWrite(operations: BatchOperation[]): Promise<void> {
    await this.apiClient.post('/batch', {operations});
  }
}

// ============================================================================
// Custom Storage Service
// ============================================================================

class CustomStorageService implements IStorageService {
  private apiClient: AxiosInstance;

  constructor(apiClient: AxiosInstance) {
    this.apiClient = apiClient;
  }

  async getPresignedUploadUrl(path: string): Promise<PresignedUploadUrl> {
    const response = await this.apiClient.post<PresignedUploadUrl>(
      '/media/upload-url',
      {path},
    );
    return response.data;
  }

  async uploadFile(
    file: File | Blob,
    path: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    // Get presigned URL
    const presigned = await this.getPresignedUploadUrl(path);

    // Upload to presigned URL
    const formData = new FormData();

    if (presigned.fields) {
      Object.entries(presigned.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    formData.append('file', file as any);

    await axios.post(presigned.url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (options?.onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          options.onProgress(progress);
        }
      },
    });

    // Return the result
    return {
      url: presigned.path,
      path: presigned.path,
      size: (file as File).size || 0,
      contentType: options?.contentType || 'application/octet-stream',
    };
  }

  async getDownloadURL(path: string): Promise<string> {
    const response = await this.apiClient.get('/media/download-url', {
      params: {path},
    });
    return response.data.url;
  }

  async deleteFile(path: string): Promise<void> {
    await this.apiClient.delete('/media', {params: {path}});
  }
}

// ============================================================================
// WebSocket Service
// ============================================================================

class WebSocketService implements IRealtimeService {
  private socket: Socket | null = null;
  private wsURL: string;
  private callbacks: Map<string, MessageCallback> = new Map();
  private errorCallback?: (error: Error) => void;
  private connectionCallback?: (connected: boolean) => void;

  constructor(wsURL: string) {
    this.wsURL = wsURL;
  }

  async connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.wsURL, {
        auth: {token},
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        this.connectionCallback?.(true);
        resolve();
      });

      this.socket.on('disconnect', () => {
        this.connectionCallback?.(false);
      });

      this.socket.on('error', (error: Error) => {
        this.errorCallback?.(error);
        reject(error);
      });

      // Handle incoming messages
      this.socket.onAny((event, data) => {
        const callback = this.callbacks.get(event);
        if (callback) {
          callback(data);
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.callbacks.clear();
    }
  }

  subscribe(channel: string, callback: MessageCallback): void {
    this.callbacks.set(channel, callback);

    if (this.socket) {
      this.socket.on(channel, callback);
    }
  }

  unsubscribe(channel: string): void {
    this.callbacks.delete(channel);

    if (this.socket) {
      this.socket.off(channel);
    }
  }

  async send(channel: string, data: any): Promise<void> {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit(channel, data, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallback = callback;
  }
}
