/**
 * Review Module
 */

import {Review, CreateReviewInput} from '@types';

export interface ReviewState {
  myReviews: Review[];
  loading: boolean;
  error: string | null;
}

export * from './services/review.service';
export * from './store/slice';
export {default as reviewReducer} from './store/slice';
