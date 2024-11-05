export interface InsightMetrics {
    tasksCompleted: number;
    completionRate: number;
    productivityScore: number;
    trendsData?: {
      daily: number[];
      weekly: number[];
      labels: string[];
    };
  }
  
  export interface LoadingStage {
    stage: string;
    progress: number;
    detail: string;
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
    name: string;
    title: string;
    description: string;
    threshold: number;
    unlockedAt?: string;
  }
  
  export interface InsightState {
    loading: boolean;
    error: string | null;
    stage: LoadingStage | null;
    addedTasks: Set<string>;
    insights: DailyInsight | null;
    showJourney: boolean;
  }
  
  // Re-export everything to make it a module
  export const VERSION = '1.0.0';