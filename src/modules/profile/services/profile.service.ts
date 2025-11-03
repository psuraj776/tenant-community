/**
 * Profile Service
 */

import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';
import {User, UserVerification} from '@types';

export class ProfileService {
  private backend = getBackendService();

  async getProfile(): Promise<User> {
    try {
      const user = await this.backend.database.getById<User>('users', 'me');
      return user!;
    } catch (error) {
      logger.error('Failed to get profile', error as Error);
      throw error;
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      logger.info('Updating profile');
      return await this.backend.database.update<User>('users', 'me', data);
    } catch (error) {
      logger.error('Failed to update profile', error as Error);
      throw error;
    }
  }

  async getVerifications(): Promise<UserVerification[]> {
    try {
      return await this.backend.database.query<UserVerification>('verifications/my');
    } catch (error) {
      logger.error('Failed to get verifications', error as Error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
