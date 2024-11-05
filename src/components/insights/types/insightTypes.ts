import { InsightMetrics } from './metricTypes';

export interface ProjectInsight {
  id: string;
  projectName: string;
  progress: string;
  analysis: string;
  challenges: string;
  opportunities: string;
  suggestedTasks: string[];
  completionRate?: number;
  priority?: 'low' | 'medium' | 'high';
  trending?: 'up' | 'down' | 'stable';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  impact: string;
  timestamp: string;
  tags?: string[];
}

export interface DailyInsight {
  id: string;
  timestamp: string;
  overview: string;
  keyAchievements: Achievement[];
  projectInsights: ProjectInsight[];
  focusRecommendation: string;
  metrics?: InsightMetrics;
  tags?: string[];
}