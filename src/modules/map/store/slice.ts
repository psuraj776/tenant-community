/**
 * Map Redux Slice
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {MapState} from '../types';
import {mapService} from '../services/map.service';
import {MapSearchParams, GeoPoint, SearchFilters} from '@types';
import {parseErrorMessage} from '@utils';

const initialState: MapState = {
  currentLocation: null,
  searchResults: null,
  filters: {},
  selectedPin: null,
  loading: false,
  error: null,
};

// Async thunks
export const getCurrentLocation = createAsyncThunk(
  'map/getCurrentLocation',
  async (_, {rejectWithValue}) => {
    try {
      return await mapService.getCurrentLocation();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const searchMap = createAsyncThunk(
  'map/search',
  async (params: MapSearchParams, {rejectWithValue}) => {
    try {
      return await mapService.searchMap(params);
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

// Slice
const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: state => {
      state.filters = {};
    },
    selectPin: (state, action: PayloadAction<string | null>) => {
      state.selectedPin = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Get current location
    builder.addCase(getCurrentLocation.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCurrentLocation.fulfilled, (state, action) => {
      state.loading = false;
      state.currentLocation = action.payload;
    });
    builder.addCase(getCurrentLocation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Search map
    builder.addCase(searchMap.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchMap.fulfilled, (state, action) => {
      state.loading = false;
      state.searchResults = action.payload;
    });
    builder.addCase(searchMap.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {setFilters, clearFilters, selectPin, clearError} = mapSlice.actions;
export default mapSlice.reducer;
