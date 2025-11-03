/**
 * Payments Module - Go Pro subscriptions
 */

import {Subscription} from '@types';

export interface PaymentsState {
  subscription: Subscription | null;
  isPro: boolean;
  loading: boolean;
  error: string | null;
}

export * from './services/payments.service';
export * from './store/slice';
export {default as paymentsReducer} from './store/slice';
