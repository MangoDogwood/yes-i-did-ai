import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/insights', () => {
    return HttpResponse.json({
      id: 'test-insight',
      timestamp: new Date().toISOString(),
      overview: 'Test insight overview',
      metrics: {
        tasksCompleted: 5,
        completionRate: 80,
        productivityScore: 75
      },
      projectInsights: [],
      keyAchievements: []
    });
  }),

  http.get('/api/tasks', () => {
    return HttpResponse.json([])
  })
];

export const server = setupServer(...handlers);