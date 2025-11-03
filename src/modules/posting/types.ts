/**
 * Posting Module Types
 */

import {Post, PostType, CreatePostInput} from '@types';

export interface PostingState {
  myPosts: Post[];
  activePosts: Post[];
  expiredPosts: Post[];
  currentDraft: Partial<CreatePostInput> | null;
  loading: boolean;
  error: string | null;
}

export interface PostMetrics {
  views: number;
  saves: number;
  chats: number;
}
