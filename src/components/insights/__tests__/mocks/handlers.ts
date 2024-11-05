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
  // Add other insight-specific handlers
];