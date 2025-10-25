/**
 * Payments Redux Slice
 */

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {PaymentsState} from '../index';
import {paymentsService} from '../services/payments.service';
import {parseErrorMessage} from '@utils';

const initialState: PaymentsState = {
  subscription: null,
  isPro: false,
  loading: false,
  error: null,
};

export const getSubscription = createAsyncThunk(
  'payments/getSubscription',
  async (_, {rejectWithValue}) => {
    try {
      return await paymentsService.getSubscription();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(getSubscription.fulfilled, (state, action) => {
      state.subscription = action.payload;
      state.isPro = action.payload?.status === 'ACTIVE';
    });
  },
});

export const {clearError} = paymentsSlice.actions;
export default paymentsSlice.reducer;
