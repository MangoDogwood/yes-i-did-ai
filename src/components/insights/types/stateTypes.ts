// src/components/insights/types/stateTypes.ts

export enum LoadingStage {
    INITIALIZING = 'INITIALIZING',
    ANALYZING = 'ANALYZING',
    GENERATING = 'GENERATING',
    COMPLETE = 'COMPLETE'
  }
  
  export interface DailyInsight {
    date: string;
    metrics: {
      completionRate: number;
      productivity: number;
      focusTime: number;
    };
    projects: Array<{
      id: string;
      name: string;
      progress: number;
      metrics: {
        completionRate: number;
        productivity: number;
        focusTime: number;
      };
    }>;
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      threshold: number;
      unlockedAt?: string;
    }>;
  }
  
  export interface InsightsState {
    loading: boolean;
    error: string | null;
    stage: LoadingStage | null;
    addedTasks: Set<string>;
    insights: DailyInsight | null;
    showJourney: boolean;
  }