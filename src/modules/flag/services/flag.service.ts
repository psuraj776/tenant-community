/**
 * Flag Service
 */

import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';
import {Flag, CreateFlagInput} from '@types';

export class FlagService {
  private backend = getBackendService();

  async createFlag(input: CreateFlagInput): Promise<Flag> {
    try {
      logger.info('Creating flag', {targetType: input.targetType, targetId: input.targetId});
      return await this.backend.database.create<Flag>('flags', input);
    } catch (error) {
      logger.error('Failed to create flag', error as Error);
      throw error;
    }
  }

  async getMyFlags(): Promise<Flag[]> {
    try {
      return await this.backend.database.query<Flag>('flags/my');
    } catch (error) {
      logger.error('Failed to get my flags', error as Error);
      throw error;
    }
  }
}

export const flagService = new FlagService();
