import type { Task as StoreTask } from '../../../store/tasksSlice';
import type { ProjectInsight } from '../types';

interface InsightTask {
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

export const mapTaskToInsightFormat = (task: StoreTask): InsightTask => ({
    id: task.id.toString(),
    projectName: task.project,
    progress: task.completed ? '100%' : '0%',
    analysis: task.description || task.summary || '',
    challenges: '', // This would need to be derived from task data
    opportunities: '', // This would need to be derived from task data
    suggestedTasks: [],
    completionRate: task.completed ? 100 : 0,
    priority: task.priority,
    trending: 'stable' // This would need to be calculated based on task history
});

export const mapTasksForInsights = (tasks: StoreTask[]): ProjectInsight[] => {
    // Group tasks by project
    const projectGroups = tasks.reduce((groups: { [key: string]: StoreTask[] }, task) => {
        const projectName = task.project || 'Uncategorized';
        if (!groups[projectName]) {
            groups[projectName] = [];
        }
        groups[projectName].push(task);
        return groups;
    }, {});

    // Convert each project group into a ProjectInsight
    return Object.entries(projectGroups).map(([projectName, projectTasks]) => {
        const completedTasks = projectTasks.filter(task => task.completed);
        const completionRate = (completedTasks.length / projectTasks.length) * 100;

        return {
            id: projectName,
            projectName,
            progress: `${Math.round(completionRate)}%`,
            analysis: `Analysis of ${projectTasks.length} tasks in ${projectName}`,
            challenges: 'Identified from task patterns',
            opportunities: 'Based on project progress',
            suggestedTasks: [],
            completionRate,
            priority: projectTasks.some(task => task.priority === 'high') ? 'high' : 'medium',
            trending: determineTrending(completedTasks)
        };
    });
};

function determineTrending(completedTasks: StoreTask[]): 'up' | 'down' | 'stable' {
    // This is a simple implementation - could be made more sophisticated
    const recentTasks = completedTasks.filter(task => {
        const completedDate = task.completedAt ? new Date(task.completedAt) : null;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return completedDate && completedDate > weekAgo;
    });

    if (recentTasks.length > completedTasks.length / 4) return 'up';
    if (recentTasks.length === 0 && completedTasks.length > 0) return 'down';
    return 'stable';
}