// src/store/insightsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { InsightState, DailyInsight, LoadingStage } from '../types';

const initialState: InsightState = {
  loading: false,
  error: null,
  stage: null,
  addedTasks: new Set<string>(),
  insights: null,
  showJourney: false,
  lastUpdated: null
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    setInsights: (state, action: PayloadAction<DailyInsight>) => {
      state.insights = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setStage: (state, action: PayloadAction<LoadingStage | null>) => {
      state.stage = action.payload;
    },
    toggleJourney: (state) => {
      state.showJourney = !state.showJourney;
    },
    addSuggestedTask: (state, action: PayloadAction<string>) => {
      state.addedTasks.add(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    clearInsights: (state) => {
      state.insights = null;
      state.stage = null;
      state.error = null;
      state.addedTasks.clear();
      state.lastUpdated = new Date().toISOString();
    }
  }
});

export const {
  setInsights,
  setLoading,
  setError,
  setStage,
  toggleJourney,
  addSuggestedTask,
  clearInsights
} = insightsSlice.actions;

export default insightsSlice.reducer;