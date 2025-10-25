/**
 * Profile Module
 */

import {User, UserVerification} from '@types';

export interface ProfileState {
  user: User | null;
  verifications: UserVerification[];
  loading: boolean;
  error: string | null;
}

export * from './services/profile.service';
export * from './store/slice';
export {default as profileReducer} from './store/slice';
