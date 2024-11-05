import { Task } from '../types';

export class PromptUtils {
  static generateTaskAnalysisPrompt(tasks: Task[]): string {
    const completedTasks = tasks.filter(t => t.completed);
    const completionRate = Math.round((completedTasks.length / tasks.length) * 100);
    const recentCompletions = completedTasks
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5);

    const projectStats = this.getProjectStats(tasks);
    const priorityBreakdown = this.getPriorityBreakdown(tasks);

    return `
      Analyze the following task management data and provide insights:

      Overall Statistics:
      - Total Tasks: ${tasks.length}
      - Completed Tasks: ${completedTasks.length}
      - Completion Rate: ${completionRate}%

      Project Breakdown:
      ${projectStats}

      Priority Distribution:
      ${priorityBreakdown}

      Recent Completions:
      ${recentCompletions.map(task => `- ${task.text} (${task.project})`).join('\n')}

      Based on this data, please provide:
      1. Insights on productivity patterns
      2. Project-specific recommendations
      3. Time management suggestions
      4. Focus areas for improvement
    `;
  }

  private static getProjectStats(tasks: Task[]): string {
    const projectMap = new Map<string, { total: number; completed: number }>();

    tasks.forEach(task => {
      const stats = projectMap.get(task.project) || { total: 0, completed: 0 };
      stats.total++;
      if (task.completed) stats.completed++;
      projectMap.set(task.project, stats);
    });

    return Array.from(projectMap.entries())
      .map(([project, stats]) => {
        const completionRate = Math.round((stats.completed / stats.total) * 100);
        return `- ${project}: ${stats.completed}/${stats.total} (${completionRate}% complete)`;
      })
      .join('\n');
  }

  private static getPriorityBreakdown(tasks: Task[]): string {
    const priorities = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    return Object.entries(priorities)
      .map(([priority, count]) => `- ${priority}: ${count} tasks`)
      .join('\n');
  }
}