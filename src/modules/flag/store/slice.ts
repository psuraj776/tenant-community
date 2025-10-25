/**
 * Flag Redux Slice
 */

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {FlagState} from '../index';
import {flagService} from '../services/flag.service';
import {CreateFlagInput} from '@types';
import {parseErrorMessage} from '@utils';

const initialState: FlagState = {
  myFlags: [],
  loading: false,
  error: null,
};

export const createFlag = createAsyncThunk(
  'flag/create',
  async (input: CreateFlagInput, {rejectWithValue}) => {
    try {
      return await flagService.createFlag(input);
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const getMyFlags = createAsyncThunk(
  'flag/getMyFlags',
  async (_, {rejectWithValue}) => {
    try {
      return await flagService.getMyFlags();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

const flagSlice = createSlice({
  name: 'flag',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(createFlag.fulfilled, (state, action) => {
      state.myFlags.unshift(action.payload);
    });
    builder.addCase(getMyFlags.fulfilled, (state, action) => {
      state.myFlags = action.payload;
    });
  },
});

export const {clearError} = flagSlice.actions;
export default flagSlice.reducer;
