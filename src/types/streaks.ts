export interface Streak {
    count: number;
    lastUpdate: string;
    longestStreak: number;
    milestones: Record<number, boolean>;
  }