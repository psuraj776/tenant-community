/**
 * Redux Store Configuration
 * Combines all module reducers and configures middleware
 */

import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

// Import all reducers
import {authReducer} from '@modules/auth';
import {profileReducer} from '@modules/profile';
import {mapReducer} from '@modules/map';
import {postingReducer} from '@modules/posting';
import {reviewReducer} from '@modules/review';
import {chatReducer} from '@modules/chat';
import {savedReducer} from '@modules/saved';
import {flagReducer} from '@modules/flag';
import {paymentsReducer} from '@modules/payments';

// Configure store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    map: mapReducer,
    posting: postingReducer,
    review: reviewReducer,
    chat: chatReducer,
    saved: savedReducer,
    flag: flagReducer,
    payments: paymentsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/verifyOTP/fulfilled'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user'],
      },
    }),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
