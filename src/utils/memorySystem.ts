// src/utils/memorySystem.ts
import type { Task } from '../store/tasksSlice';
import type { DailyInsight } from '../types/insight';

interface UserContext {
  projects: {
    [projectName: string]: {
      description: string;
      type: string;
      priority: string;
      completionPatterns: {
        timeOfDay: string[];
        daysOfWeek: string[];
        averageCompletionTime: number;
      };
      recentActivity: {
        lastActive: string;
        completionRate: number;
        taskTypes: string[];
      };
    };
  };
  workPatterns: {
    productiveHours: string[];
    preferredTaskTypes: string[];
    commonChallenges: string[];
    strengths: string[];
  };
  longTermGoals: {
    personal: string[];
    professional: string[];
    timeframes: {
      [goalId: string]: {
        start: string;
        target: string;
        progress: number;
      };
    };
  };
}

interface MemoryData {
  insights: DailyInsight[];
  context: UserContext;
  patterns: Record<string, any>;
  lastUpdate: string;
}

export class MemorySystem {
  private storage: Storage;
  private readonly STORAGE_KEY = 'yesIdidAI_memory';
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  constructor() {
    this.storage = window.localStorage;
    this.initializeMemory();
  }

  private initializeMemory(): void {
    if (!this.storage.getItem(this.STORAGE_KEY)) {
      const initialMemory: MemoryData = {
        insights: [],
        context: {
          projects: {},
          workPatterns: {
            productiveHours: [],
            preferredTaskTypes: [],
            commonChallenges: [],
            strengths: []
          },
          longTermGoals: {
            personal: [],
            professional: [],
            timeframes: {}
          }
        },
        patterns: {},
        lastUpdate: new Date().toISOString()
      };
      this.storage.setItem(this.STORAGE_KEY, JSON.stringify(initialMemory));
    }
  }

  getLastInsights(): DailyInsight | null {
    const data = this.getMemory();
    const insights = data.insights || [];
    return insights.length > 0 ? insights[insights.length - 1] : null;
  }

  generateInsightPrompt(tasks: Task[]): string {
    const memory = this.getMemory();
    const recentInsights = this.getRecentInsights();
    const context = memory.context;
    const patterns = this.analyzePatterns(tasks);
    
    return `
      As an AI assistant with deep knowledge of ${
        Object.keys(context.projects).length
      } projects and this user's work patterns, provide insights based on:

      User Work Patterns:
      ${context.workPatterns.productiveHours.length > 0 ? `
      - Most productive during: ${context.workPatterns.productiveHours.join(', ')}
      - Strengths: ${context.workPatterns.strengths.join(', ')}
      - Common challenges: ${context.workPatterns.commonChallenges.join(', ')}
      ` : 'No work patterns established yet.'}

      Recent Project Activity:
      ${Object.entries(context.projects)
        .map(([name, data]) => `
          ${name}:
          - Completion rate: ${data.recentActivity.completionRate}%
          - Last active: ${data.recentActivity.lastActive}
          - Common task types: ${data.recentActivity.taskTypes.join(', ')}
        `).join('\n')}

      Recent Insights:
      ${recentInsights.map(i => i.overview).join('\n\n')}

      New Pattern Observations:
      ${patterns}

      Current Tasks:
      ${JSON.stringify(tasks, null, 2)}

      Based on this comprehensive context, please provide:
      1. Detailed progress analysis for each active project
      2. Personalized recommendations based on observed patterns
      3. Focus suggestions aligned with the user's productive hours
      4. Task recommendations that match established patterns
      5. Potential challenges to watch out for based on historical data
    `;
  }

  generateVoicePrompt(transcript: string): string {
    const context = this.getMemory().context;
    const projects = Object.keys(context.projects);
    
    return `
      Given the user's existing projects: [${projects.join(', ')}]
      And common task patterns: ${context.workPatterns.preferredTaskTypes.join(', ')}

      Parse this voice input into a task:
      "${transcript}"

      Return a valid task object with these fields:
      {
        "text": "task description",
        "project": "project name (prefer existing projects if relevant)",
        "priority": "high|medium|low",
        "summary": "",
        "dueDate": null,
        "tags": [],
        "subtasks": [],
        "completedAt": null,
        "completedInWeek": null,
        "completedInMonth": null,
        "completedInYear": null,
        "archived": false
      }
    `;
  }

  private analyzePatterns(tasks: Task[]): string {
    // Analyze completion patterns
    const completedTasks = tasks.filter(t => t.completed && t.completedAt);
    
    // Time patterns
    const completionTimes = completedTasks.map(t => new Date(t.completedAt!).getHours());
    const commonTimes = this.findCommonPatterns(completionTimes);

    // Project patterns
    const projectCompletions = completedTasks.reduce((acc, task) => {
      acc[task.project] = (acc[task.project] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
      Time Patterns:
      - Most productive hours: ${commonTimes.join(', ')}
      
      Project Completion Patterns:
      ${Object.entries(projectCompletions)
        .map(([project, count]) => `- ${project}: ${count} tasks completed`)
        .join('\n')}
    `;
  }

  private findCommonPatterns(numbers: number[]): number[] {
    const frequency = numbers.reduce((acc, num) => {
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private getMemory(): MemoryData {
    const stored = this.storage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : this.initializeMemory();
  }

  private getRecentInsights(): DailyInsight[] {
    const data = this.getMemory();
    return (data.insights || []).slice(-3);
  }

  updateMemory(type: 'insights' | 'voice', data: any): void {
    const memory = this.getMemory();
    
    if (type === 'insights') {
      memory.insights = [...(memory.insights || []), data];
      if (memory.insights.length > 10) {
        memory.insights = memory.insights.slice(-10);
      }

      // Update context based on new insights
      this.updateContext(data);
    }

    memory.lastUpdate = new Date().toISOString();
    this.storage.setItem(this.STORAGE_KEY, JSON.stringify(memory));
  }

  private updateContext(newInsight: DailyInsight): void {
    const memory = this.getMemory();
    const context = memory.context;

    // Update project information
    newInsight.projectInsights.forEach(projectInsight => {
      if (!context.projects[projectInsight.projectName]) {
        context.projects[projectInsight.projectName] = {
          description: '',
          type: '',
          priority: projectInsight.priority || 'medium',
          completionPatterns: {
            timeOfDay: [],
            daysOfWeek: [],
            averageCompletionTime: 0
          },
          recentActivity: {
            lastActive: new Date().toISOString(),
            completionRate: 0,
            taskTypes: []
          }
        };
      }

      const project = context.projects[projectInsight.projectName];
      project.recentActivity.lastActive = new Date().toISOString();
      // Update other project stats...
    });

    this.storage.setItem(this.STORAGE_KEY, JSON.stringify(memory));
  }
}

export const memorySystem = new MemorySystem();