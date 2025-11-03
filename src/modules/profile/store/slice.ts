/**
 * Profile Redux Slice
 */

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {ProfileState} from '../index';
import {profileService} from '../services/profile.service';
import {User} from '@types';
import {parseErrorMessage} from '@utils';

const initialState: ProfileState = {
  user: null,
  verifications: [],
  loading: false,
  error: null,
};

export const getProfile = createAsyncThunk(
  'profile/get',
  async (_, {rejectWithValue}) => {
    try {
      return await profileService.getProfile();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (data: Partial<User>, {rejectWithValue}) => {
    try {
      return await profileService.updateProfile(data);
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const getVerifications = createAsyncThunk(
  'profile/verifications',
  async (_, {rejectWithValue}) => {
    try {
      return await profileService.getVerifications();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(getProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(getVerifications.fulfilled, (state, action) => {
      state.verifications = action.payload;
    });
  },
});

export const {clearError} = profileSlice.actions;
export default profileSlice.reducer;
