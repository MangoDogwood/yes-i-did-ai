// src/types/index.ts

export interface Task {
    id: number;
    text: string;
    title: string;
    completed: boolean;
    project: string;
    priority: 'low' | 'medium' | 'high';
    summary: string;
    description?: string;
    dueDate: string | null;
    createdAt: string;          // Add this field
    tags: string[];
    subtasks: Task[];
    completedAt: string | null;
    completedInWeek: number;
    completedInMonth: number;
    completedInYear: number;
    archived: boolean;
  }
  
  export interface LoadingStage {
    stage: string;
    progress: number;
    detail: string;
  }
  
  export interface InsightState {
    loading: boolean;
    error: string | null;
    stage: LoadingStage | null;
    addedTasks: Set<string>;
    insights: DailyInsight | null;
    showJourney: boolean;
    lastUpdated: string | null;  // Add this missing property
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
    title: string;
    name: string;  // Add this for backward compatibility
    description: string;
    threshold: number;
    unlockedAt?: string;
    impact?: string;  // Add this for InsightsPDF
    tags?: string[];  // Add this for InsightsPDF
  }
  
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

  export interface StreakData {
    count: number;
    lastUpdate: string;
    longestStreak: number;  // Add this missing property
    milestones: Record<number, boolean>;
  }
  
  // Utility functions
  export const isTaskCompleted = (task: Task): boolean => {
    return Boolean(task.completedAt);
  };