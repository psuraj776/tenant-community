/**
 * Auth Redux Slice
 * Manages authentication state
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AuthState, AuthUser} from '../types';
import {authService} from '../services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {parseErrorMessage} from '@utils';

const STORAGE_KEY = '@auth';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// Async thunks
export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async (phone: string, {rejectWithValue}) => {
    try {
      await authService.requestOTP(phone);
      return phone;
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({phone, code}: {phone: string; code: string}, {rejectWithValue}) => {
    try {
      const result = await authService.verifyOTP(phone, code);
      
      // Persist auth data
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }),
      );

      return result;
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async (_, {rejectWithValue}) => {
  try {
    await authService.logout();
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    return rejectWithValue(parseErrorMessage(error));
  }
});

export const loadAuthFromStorage = createAsyncThunk('auth/loadFromStorage', async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return null;
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload};
      }
    },
    setTokens: (
      state,
      action: PayloadAction<{accessToken: string; refreshToken: string}>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: builder => {
    // Request OTP
    builder.addCase(requestOTP.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(requestOTP.fulfilled, state => {
      state.loading = false;
    });
    builder.addCase(requestOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Verify OTP
    builder.addCase(verifyOTP.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyOTP.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user as AuthUser;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    });
    builder.addCase(verifyOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.fulfilled, state => {
      return initialState;
    });

    // Load from storage
    builder.addCase(loadAuthFromStorage.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      }
    });
  },
});

export const {clearError, updateUser, setTokens} = authSlice.actions;
export default authSlice.reducer;
