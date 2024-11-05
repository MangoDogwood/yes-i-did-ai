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