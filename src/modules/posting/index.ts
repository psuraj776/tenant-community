/**
 * Posting Module
 * Handles creation and management of posts (Flat, Flatmates, Sell)
 */

export * from './types';
export * from './services/posting.service';
export * from './store/slice';
export {default as postingReducer} from './store/slice';
