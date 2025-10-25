# Module Development Guide

This guide explains how to create new modules in the Tenant Community app.

## Module Structure

Each module should be self-contained with:

```
src/modules/[module-name]/
├── index.ts                 # Public API exports
├── types.ts                 # Module-specific types
├── services/
│   └── [name].service.ts    # Business logic
├── store/
│   └── slice.ts             # Redux Toolkit slice
├── components/              # Module UI components
│   └── index.tsx
├── screens/                 # Full-page screens
│   └── [Name]Screen.tsx
├── hooks/                   # Custom hooks
│   └── use[Hook].ts
└── utils/                   # Module utilities
    └── helpers.ts
```

## Step-by-Step Module Creation

### 1. Create Types (`types.ts`)

Define TypeScript interfaces for your module:

```typescript
export interface MyModuleState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

export interface Item {
  id: string;
  name: string;
}
```

### 2. Create Service (`services/mymodule.service.ts`)

Implement business logic using the backend service:

```typescript
import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';

export class MyModuleService {
  private backend = getBackendService();

  async getItems(): Promise<Item[]> {
    try {
      logger.info('Getting items');
      return await this.backend.database.query<Item>('items');
    } catch (error) {
      logger.error('Failed to get items', error as Error);
      throw error;
    }
  }
}

export const myModuleService = new MyModuleService();
```

### 3. Create Redux Slice (`store/slice.ts`)

Set up state management:

```typescript
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {MyModuleState} from '../types';
import {myModuleService} from '../services/mymodule.service';
import {parseErrorMessage} from '@utils';

const initialState: MyModuleState = {
  items: [],
  loading: false,
  error: null,
};

export const getItems = createAsyncThunk(
  'myModule/getItems',
  async (_, {rejectWithValue}) => {
    try {
      return await myModuleService.getItems();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

const myModuleSlice = createSlice({
  name: 'myModule',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(getItems.pending, state => {
      state.loading = true;
    });
    builder.addCase(getItems.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(getItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {clearError} = myModuleSlice.actions;
export default myModuleSlice.reducer;
```

### 4. Export Public API (`index.ts`)

```typescript
export * from './types';
export * from './services/mymodule.service';
export * from './store/slice';
export {default as myModuleReducer} from './store/slice';
```

### 5. Register in Store

Add to `src/store/index.ts`:

```typescript
import {myModuleReducer} from '@modules/myModule';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    myModule: myModuleReducer,
  },
});
```

## Best Practices

1. **Type Everything**: Use TypeScript interfaces for all data structures
2. **Error Handling**: Always catch and log errors
3. **Loading States**: Track loading state for async operations
4. **Optimistic Updates**: Update UI immediately, rollback on error
5. **Logging**: Use the logger service with appropriate log levels
6. **Testing**: Write unit tests for services and reducers

## Backend Integration

The module should use the backend service abstraction:

```typescript
import {getBackendService} from '@services/backend';

const backend = getBackendService();

// Auth
await backend.auth.requestOTP({phone});

// Database
const items = await backend.database.query<Item>('collection');

// Storage
const result = await backend.storage.uploadFile(file, path);

// Realtime
await backend.realtime.connect(token);
```

This ensures compatibility with both Firebase and custom backends.

## Example: Creating a "Notifications" Module

1. Create folder: `src/modules/notifications/`
2. Add types for notification structure
3. Create service to fetch/mark notifications
4. Create Redux slice with actions
5. Build components to display notifications
6. Add to navigation if needed
7. Register reducer in store

## Questions?

Refer to existing modules like `auth`, `posting`, or `chat` for examples.
