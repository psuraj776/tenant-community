/**
 * Posting Redux Slice
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {PostingState} from '../types';
import {postingService} from '../services/posting.service';
import {CreatePostInput, Post} from '@types';
import {parseErrorMessage} from '@utils';

const initialState: PostingState = {
  myPosts: [],
  activePosts: [],
  expiredPosts: [],
  currentDraft: null,
  loading: false,
  error: null,
};

export const createPost = createAsyncThunk(
  'posting/create',
  async (input: CreatePostInput, {rejectWithValue}) => {
    try {
      return await postingService.createPost(input);
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const getMyPosts = createAsyncThunk(
  'posting/getMyPosts',
  async (_, {rejectWithValue}) => {
    try {
      return await postingService.getMyPosts();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

const postingSlice = createSlice({
  name: 'posting',
  initialState,
  reducers: {
    saveDraft: (state, action: PayloadAction<Partial<CreatePostInput>>) => {
      state.currentDraft = action.payload;
    },
    clearDraft: state => {
      state.currentDraft = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(createPost.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.loading = false;
      state.myPosts.unshift(action.payload);
      state.currentDraft = null;
    });
    builder.addCase(createPost.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(getMyPosts.fulfilled, (state, action) => {
      state.myPosts = action.payload;
      state.activePosts = action.payload.filter(p => p.isActive);
      state.expiredPosts = action.payload.filter(p => !p.isActive);
    });
  },
});

export const {saveDraft, clearDraft, clearError} = postingSlice.actions;
export default postingSlice.reducer;
