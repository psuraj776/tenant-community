/**
 * Review Redux Slice
 */

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {ReviewState} from '../index';
import {reviewService} from '../services/review.service';
import {CreateReviewInput} from '@types';
import {parseErrorMessage} from '@utils';

const initialState: ReviewState = {
  myReviews: [],
  loading: false,
  error: null,
};

export const createReview = createAsyncThunk(
  'review/create',
  async (input: CreateReviewInput, {rejectWithValue}) => {
    try {
      return await reviewService.createReview(input);
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const getMyReviews = createAsyncThunk(
  'review/getMyReviews',
  async (_, {rejectWithValue}) => {
    try {
      return await reviewService.getMyReviews();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(createReview.pending, state => {
      state.loading = true;
    });
    builder.addCase(createReview.fulfilled, (state, action) => {
      state.loading = false;
      state.myReviews.unshift(action.payload);
    });
    builder.addCase(createReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(getMyReviews.fulfilled, (state, action) => {
      state.myReviews = action.payload;
    });
  },
});

export const {clearError} = reviewSlice.actions;
export default reviewSlice.reducer;
