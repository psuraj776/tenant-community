/**
 * Review Service
 */

import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';
import {Review, CreateReviewInput} from '@types';

export class ReviewService {
  private backend = getBackendService();

  async createReview(input: CreateReviewInput): Promise<Review> {
    try {
      logger.info('Creating review');
      const review = await this.backend.database.create<Review>('reviews', input);
      logger.info('Review created successfully', {reviewId: review.id});
      return review;
    } catch (error) {
      logger.error('Failed to create review', error as Error);
      throw error;
    }
  }

  async getMyReviews(): Promise<Review[]> {
    try {
      return await this.backend.database.query<Review>('reviews/my');
    } catch (error) {
      logger.error('Failed to get my reviews', error as Error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();
