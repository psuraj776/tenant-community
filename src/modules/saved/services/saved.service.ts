/**
 * Saved Service
 */

import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';
import {SavedItem, ItemType} from '@types';

export class SavedService {
  private backend = getBackendService();

  async getSavedItems(): Promise<SavedItem[]> {
    try {
      return await this.backend.database.query<SavedItem>('saved');
    } catch (error) {
      logger.error('Failed to get saved items', error as Error);
      throw error;
    }
  }

  async saveItem(itemType: ItemType, itemId: string): Promise<void> {
    try {
      logger.info('Saving item', {itemType, itemId});
      await this.backend.database.create('saved', {itemType, itemId});
    } catch (error) {
      logger.error('Failed to save item', error as Error);
      throw error;
    }
  }

  async unsaveItem(itemType: ItemType, itemId: string): Promise<void> {
    try {
      logger.info('Unsaving item', {itemType, itemId});
      await this.backend.database.delete('saved', `${itemType}-${itemId}`);
    } catch (error) {
      logger.error('Failed to unsave item', error as Error);
      throw error;
    }
  }
}

export const savedService = new SavedService();
