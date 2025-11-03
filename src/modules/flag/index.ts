/**
 * Flag/Moderation Module
 */

import {Flag, CreateFlagInput} from '@types';

export interface FlagState {
  myFlags: Flag[];
  loading: boolean;
  error: string | null;
}

export * from './services/flag.service';
export * from './store/slice';
export {default as flagReducer} from './store/slice';
