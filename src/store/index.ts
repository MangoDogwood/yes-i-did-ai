// src/store/index.ts

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import tasksReducer, { TasksState } from './tasksSlice';
import profileReducer from './profileSlice';
import type { ProfileState } from './profileSlice';
import insightsReducer from './insightsSlice';
import type { InsightState } from '../types';

/**
 * Configure Redux store with middleware and type safety
 */
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    profile: profileReducer,
    insights: insightsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER'
        ],
        ignoredActionPaths: [
          'payload.addedTasks',
          'meta.arg',
          'payload.timestamp'
        ],
        ignoredPaths: [
          'insights.addedTasks',
          'tasks.lastOperation',
          'profile.sessionData'
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Root state type
export interface RootState {
  tasks: TasksState;
  profile: ProfileState;
  insights: InsightState;
}

// Redux specific types
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Export type definitions
export type { TasksState } from './tasksSlice';
export type { ProfileState } from './profileSlice';
export type { InsightState } from '../types';
export type { Task } from '../types';

// Utility function exports
export { isTaskCompleted } from '../utils/taskUtils';

// Typed hooks helper
export const createStoreHook = <T>(selector: (state: RootState) => T) => {
  return () => useSelector(selector);
};

// Type guard for store initialization
export const isStoreInitialized = (
  store: unknown
): store is typeof configureStore => {
  return store !== undefined && 
         store !== null && 
         typeof (store as any).dispatch === 'function';
};

export default store;