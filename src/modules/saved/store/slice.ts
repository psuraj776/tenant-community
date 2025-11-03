/**
 * Saved Redux Slice
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {SavedState} from '../index';
import {savedService} from '../services/saved.service';
import {ItemType} from '@types';
import {parseErrorMessage} from '@utils';

const initialState: SavedState = {
  items: [],
  loading: false,
  error: null,
};

export const getSavedItems = createAsyncThunk(
  'saved/getItems',
  async (_, {rejectWithValue}) => {
    try {
      return await savedService.getSavedItems();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const saveItem = createAsyncThunk(
  'saved/save',
  async ({itemType, itemId}: {itemType: ItemType; itemId: string}, {rejectWithValue}) => {
    try {
      await savedService.saveItem(itemType, itemId);
      return {itemType, itemId};
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const unsaveItem = createAsyncThunk(
  'saved/unsave',
  async ({itemType, itemId}: {itemType: ItemType; itemId: string}, {rejectWithValue}) => {
    try {
      await savedService.unsaveItem(itemType, itemId);
      return {itemType, itemId};
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

const savedSlice = createSlice({
  name: 'saved',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(getSavedItems.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(saveItem.fulfilled, (state, action) => {
      // Optimistically add to list
      state.items.unshift({
        userId: '',
        itemType: action.payload.itemType,
        itemId: action.payload.itemId,
        createdAt: new Date().toISOString(),
      });
    });
    builder.addCase(unsaveItem.fulfilled, (state, action) => {
      state.items = state.items.filter(
        item => !(item.itemType === action.payload.itemType && item.itemId === action.payload.itemId)
      );
    });
  },
});

export const {clearError} = savedSlice.actions;
export default savedSlice.reducer;
