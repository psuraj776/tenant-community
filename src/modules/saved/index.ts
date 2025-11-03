/**
 * Saved Module - Bookmarks/Saved items
 */

import {SavedItem} from '@types';

export interface SavedState {
  items: SavedItem[];
  loading: boolean;
  error: string | null;
}

export * from './services/saved.service';
export * from './store/slice';
export {default as savedReducer} from './store/slice';
