import React from 'react';
import { render, screen, fireEvent } from './utils';
import InsightsTab from '../InsightsTab';
import { testData } from './utils';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

describe('InsightsTab', () => {
  beforeEach(() => {
    // Reset to default handlers
    server.resetHandlers();
  });

  it('renders generate insights button when no insights exist', () => {
    render(<InsightsTab />, {
      preloadedState: {
        tasks: {
          tasks: testData.tasks,
          loading: false,
          error: null,
          lastUpdated: null,
          streak: {
            count: 0,
            lastUpdate: new Date().toISOString(),
            milestones: {}
          },
          achievements: []
        },
        insights: testData.insights
      }
    });

    expect(screen.getByText('Generate Insights')).toBeInTheDocument();
  });

  it('handles generate insights click', async () => {
    // Mock successful insight generation
    server.use(
      http.post('/api/insights', () => {
        return HttpResponse.json({
          id: 'test-insight',
          timestamp: new Date().toISOString(),
          overview: 'Test Overview',
          metrics: {
            tasksCompleted: 1,
            completionRate: 100,
            productivityScore: 85
          },
          projectInsights: [],
          keyAchievements: []
        });
      })
    );

    render(<InsightsTab />, {
      preloadedState: {
        tasks: {
          tasks: testData.tasks,
          loading: false,
          error: null,
          lastUpdated: null,
          streak: {
            count: 0,
            lastUpdate: new Date().toISOString(),
            milestones: {}
          },
          achievements: []
        },
        insights: testData.insights
      }
    });

    const generateButton = screen.getByText('Generate Insights');
    fireEvent.click(generateButton);

    // Wait for insights to be generated
    expect(await screen.findByText('Test Overview')).toBeInTheDocument();
  });
});