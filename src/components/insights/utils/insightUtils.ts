// src/components/insights/utils/insightUtils.ts
import { DailyInsight, ProjectInsight } from '../types';
import { Task } from '../../../types';

export const validateInsightData = (data: any): data is DailyInsight => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid insight data: must be an object');
  }

  const requiredFields = ['overview', 'keyAchievements', 'projectInsights', 'focusRecommendation'];
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (!Array.isArray(data.keyAchievements)) {
    throw new Error('keyAchievements must be an array');
  }

  if (!Array.isArray(data.projectInsights)) {
    throw new Error('projectInsights must be an array');
  }

  return true;
};

export const processInsights = async (
  data: any, 
  tasks: Task[]
): Promise<DailyInsight> => {
  const completedTasks = tasks.filter(t => t.completed);
  const metrics = {
    tasksCompleted: completedTasks.length,
    completionRate: Math.round((completedTasks.length / tasks.length) * 100) || 0,
    productivityScore: calculateProductivityScore(tasks),
    trendsData: await calculateTrends(tasks)
  };

  return {
    ...data,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    metrics,
    projectInsights: data.projectInsights.map((p: ProjectInsight) => ({
      ...p,
      completionRate: calculateProjectCompletionRate(tasks, p.projectName),
      trending: calculateProjectTrend(tasks, p.projectName)
    }))
  };
};

const calculateProductivityScore = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;

  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  const recentCompletions = tasks.filter(task => {
    if (!task.completedAt) return false;
    const completedTime = new Date(task.completedAt).getTime();
    return (now - completedTime) <= dayInMs;
  });

  const completionRate = (recentCompletions.length / tasks.length) * 100;
  const consistencyBonus = calculateConsistencyBonus(tasks);
  const priorityBonus = calculatePriorityBonus(recentCompletions);

  return Math.min(100, Math.round(
    (completionRate * 0.5) +  // 50% weight to completion rate
    (consistencyBonus * 0.3) + // 30% weight to consistency
    (priorityBonus * 0.2)      // 20% weight to priority handling
  ));
};

const calculateConsistencyBonus = (tasks: Task[]): number => {
  const completedTasks = tasks.filter(t => t.completed && t.completedAt);
  if (completedTasks.length < 2) return 0;

  const timestamps = completedTasks
    .map(t => new Date(t.completedAt!).getTime())
    .sort();
    
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i-1]);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const stdDev = Math.sqrt(
    intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
  );

  // Lower standard deviation means more consistent completions
  const consistencyScore = Math.max(0, 100 - (stdDev / (24 * 60 * 60 * 1000)));
  return consistencyScore;
};

const calculatePriorityBonus = (tasks: Task[]): number => {
  const priorityWeights = {
    high: 3,
    medium: 2,
    low: 1
  };

  const priorityScore = tasks.reduce((score, task) => {
    return score + (priorityWeights[task.priority || 'medium']);
  }, 0);

  return Math.min(100, (priorityScore / (tasks.length * 3)) * 100);
};

const calculateProjectCompletionRate = (tasks: Task[], projectName: string): number => {
  const projectTasks = tasks.filter(t => t.project === projectName);
  if (projectTasks.length === 0) return 0;

  const completed = projectTasks.filter(t => t.completed).length;
  return Math.round((completed / projectTasks.length) * 100);
};

const calculateProjectTrend = (tasks: Task[], projectName: string): 'up' | 'down' | 'stable' => {
  const projectTasks = tasks.filter(t => t.project === projectName && t.completedAt);
  if (projectTasks.length < 2) return 'stable';

  const now = Date.now();
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  
  const recentTasks = projectTasks.filter(t => 
    (now - new Date(t.completedAt!).getTime()) <= weekInMs
  );
  
  const olderTasks = projectTasks.filter(t => 
    (now - new Date(t.completedAt!).getTime()) > weekInMs &&
    (now - new Date(t.completedAt!).getTime()) <= 2 * weekInMs
  );

  const recentRate = recentTasks.length;
  const olderRate = olderTasks.length;

  if (recentRate > olderRate * 1.2) return 'up';
  if (recentRate < olderRate * 0.8) return 'down';
  return 'stable';
};

const calculateTrends = async (tasks: Task[]) => {
  const now = new Date();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  const daily = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * dayInMs);
    const dayTasks = tasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate.toDateString() === date.toDateString();
    });
    return dayTasks.length;
  });

  const labels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * dayInMs);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  return {
    daily,
    weekly: [], // Implement if needed
    labels
  };
};