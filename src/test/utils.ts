import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { configureStore, type ConfigureStoreOptions } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import type { RenderOptions } from '@testing-library/react';
import type { RootState } from '../store';

// Reducers
import tasksReducer from '../store/tasksSlice';
import insightsReducer from '../store/insightsSlice';
import profileReducer from '../store/profileSlice';

type ExtendedRenderOptions = {
  initialState?: Partial<RootState>;
  route?: string;
  storeOptions?: Omit<ConfigureStoreOptions, 'reducer'>;
} & Omit<RenderOptions, 'wrapper'>;

function render(
  ui: React.ReactElement,
  {
    initialState = {},
    route = '/',
    storeOptions = {},
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const store = configureStore({
    reducer: {
      tasks: tasksReducer,
      insights: insightsReducer,
      profile: profileReducer
    },
    preloadedState: initialState,
    ...storeOptions
  });

  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      Provider,
      { store, children: React.createElement(
        BrowserRouter,
        null,
        children
      )}
    );
  }

  return {
    store,
    ...rtlRender(ui, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  };
}

// Test Helpers
const createMatchMedia = (width: number) => {
  return (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
};

// Common test data
const testData = {
  tasks: [
    {
      id: '1',
      title: 'Test Task',
      text: 'Test Description',
      completed: false,
      project: 'Test Project',
      priority: 'medium' as const,
      createdAt: new Date().toISOString(),
      summary: 'Test Summary',
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
  ]
};

export { render, createMatchMedia, testData };
export * from '@testing-library/react';