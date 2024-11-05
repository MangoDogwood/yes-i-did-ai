export interface Achievement {
    id: string;
    name: string;
    title: string;
    description: string;
    threshold: number;
    unlockedAt?: string;
  }