/**
 * Application configuration
 * Loads environment variables and provides typed configuration
 */

import {AppConfig, BackendType, FirebaseConfig} from '@types';

// Type declarations for environment variables
declare module '@env' {
  export const BACKEND_TYPE: string;
  export const API_BASE_URL: string;
  export const WS_URL: string;
  export const MAPBOX_ACCESS_TOKEN: string;
  export const GOOGLE_MAPS_API_KEY: string;
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
  export const SENTRY_DSN: string;
}

// Import environment variables
import {
  BACKEND_TYPE,
  API_BASE_URL,
  WS_URL,
  MAPBOX_ACCESS_TOKEN,
  GOOGLE_MAPS_API_KEY,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  SENTRY_DSN,
} from '@env';

// Firebase configuration
const firebaseConfig: FirebaseConfig | undefined =
  BACKEND_TYPE === 'firebase'
    ? {
        apiKey: FIREBASE_API_KEY,
        authDomain: FIREBASE_AUTH_DOMAIN,
        projectId: FIREBASE_PROJECT_ID,
        storageBucket: FIREBASE_STORAGE_BUCKET,
        messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
        appId: FIREBASE_APP_ID,
      }
    : undefined;

// Main application configuration
const config: AppConfig = {
  backendType: (BACKEND_TYPE || 'custom') as BackendType,
  apiBaseUrl: API_BASE_URL || 'http://localhost:3000/v1',
  wsUrl: WS_URL || 'ws://localhost:3000/ws',
  mapProvider: MAPBOX_ACCESS_TOKEN ? 'mapbox' : 'google',
  mapAccessToken: MAPBOX_ACCESS_TOKEN || GOOGLE_MAPS_API_KEY || '',
  sentryDsn: SENTRY_DSN,
  firebase: firebaseConfig,
};

// Validate configuration
export const validateConfig = (): void => {
  if (!config.apiBaseUrl && config.backendType === 'custom') {
    console.warn('API_BASE_URL is not set, using default localhost');
  }

  if (!config.mapAccessToken) {
    console.warn('Map access token not configured');
  }

  if (config.backendType === 'firebase' && !config.firebase) {
    throw new Error('Firebase configuration is missing');
  }
};

export default config;
