import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { configureStore, type StateFromReducersMapObject, type ReducersMapObject } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import type { RenderOptions } from '@testing-library/react';

// Import your reducers
import tasksReducer from '../../../store/tasksSlice';
import insightsReducer from '../../../store/insightsSlice';
import profileReducer from '../../../store/profileSlice';
import type { RootState } from '../../../store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof configureStore>;
  route?: string;
}

const reducers = {
  tasks: tasksReducer,
  insights: insightsReducer,
  profile: profileReducer
} as const;

function customRender(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: reducers,
      preloadedState
    }),
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  // Wrap provider in FC to avoid type issues with children
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  };

  return {
    ...rtlRender(ui, { 
      wrapper: Wrapper,
      ...renderOptions 
    }),
    store
  };
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Common test data
export const testData = {
  tasks: [
    {
      id: '1',
      title: 'Test Task',
      text: 'Test Task Description',
      completed: false,
      project: 'Test Project',
      priority: 'medium' as const,
      summary: 'Test Summary',
      createdAt: new Date().toISOString(),
      description: 'Test Description',
      dueDate: null,
      tags: [],
      subtasks: [],
      completedAt: null,
      completedInWeek: null,
      completedInMonth: null,
      completedInYear: null,
      archived: false
    }
  ],
  insights: {
    loading: false,
    error: null,
    stage: null,
    insights: null,
    addedTasks: new Set<string>(),
    showJourney: false
  }
};