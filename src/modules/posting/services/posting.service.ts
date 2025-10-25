/**
 * Posting Service
 */

import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';
import {Post, CreatePostInput} from '@types';

export class PostingService {
  private backend = getBackendService();

  async createPost(input: CreatePostInput): Promise<Post> {
    try {
      logger.info('Creating post', {type: input.type});
      const post = await this.backend.database.create<Post>('posts', input);
      logger.info('Post created successfully', {postId: post.id});
      return post;
    } catch (error) {
      logger.error('Failed to create post', error as Error);
      throw error;
    }
  }

  async getMyPosts(): Promise<Post[]> {
    try {
      return await this.backend.database.query<Post>('posts/my');
    } catch (error) {
      logger.error('Failed to get my posts', error as Error);
      throw error;
    }
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post> {
    try {
      return await this.backend.database.update<Post>('posts', id, data);
    } catch (error) {
      logger.error('Failed to update post', error as Error, {postId: id});
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      await this.backend.database.delete('posts', id);
      logger.info('Post deleted', {postId: id});
    } catch (error) {
      logger.error('Failed to delete post', error as Error, {postId: id});
      throw error;
    }
  }
}

export const postingService = new PostingService();
