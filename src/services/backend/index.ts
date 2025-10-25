/**
 * Backend Service Factory
 * Creates the appropriate backend service based on configuration
 */

import config from '@config';
import {IBackendService} from './interfaces';
import {CustomBackendService} from './custom.backend';
import {FirebaseBackendService} from './firebase.backend';

let backendServiceInstance: IBackendService | null = null;

/**
 * Get or create backend service instance (Singleton)
 */
export const getBackendService = (): IBackendService => {
  if (backendServiceInstance) {
    return backendServiceInstance;
  }

  if (config.backendType === 'firebase') {
    if (!config.firebase) {
      throw new Error('Firebase configuration is missing');
    }
    backendServiceInstance = new FirebaseBackendService(config.firebase);
  } else {
    backendServiceInstance = new CustomBackendService({
      baseURL: config.apiBaseUrl,
      wsURL: config.wsUrl,
    });
  }

  return backendServiceInstance;
};

/**
 * Reset backend service (useful for testing)
 */
export const resetBackendService = (): void => {
  backendServiceInstance = null;
};

// Export interfaces and implementations
export * from './interfaces';
export {CustomBackendService} from './custom.backend';
export {FirebaseBackendService} from './firebase.backend';
