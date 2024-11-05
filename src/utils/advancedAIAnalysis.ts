import { Task } from '../store/tasksSlice';
import { getClaudeAnalysis } from './claudeApiClient';

interface WeeklyAnalysis {
  summary: string;
  insights: string;
  recommendations: string;
}

interface UserContext {
  name: string;
  preferences: {
    workStyle: string;
    motivationFactors: string[];
  };
  historicalData: {
    averageTasksPerWeek: number;
    commonProjects: string[];
    productivityPeaks: string[];
  };
}

function aggregateWeeklyData(tasks: Task[]): string {
  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // Fix the Set iteration issue
  const projectSet = new Set<string>();
  tasks.forEach(task => projectSet.add(task.project));
  const projects = Array.from(projectSet);

  const tasksByPriority = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  return `
    This week's summary:
    - Completed tasks: ${completedTasks.length}
    - Incomplete tasks: ${incompleteTasks.length}
    - Active projects: ${projects.join(', ')}
    - Task breakdown by priority:
      High: ${tasksByPriority.high}
      Medium: ${tasksByPriority.medium}
      Low: ${tasksByPriority.low}
  `;
}

function generatePrompt(weeklyData: string, userContext: UserContext): string {
  const {
    name,
    preferences: { workStyle, motivationFactors },
    historicalData: { averageTasksPerWeek, commonProjects, productivityPeaks }
  } = userContext;

  return `
    As an AI assistant, analyze the following weekly task data and user context. Provide in-depth insights, 
    recommendations, and encouraging messages tailored to the user's work style and preferences.

    Weekly Data:
    ${weeklyData}

    User Context:
    Name: ${name}
    Work Style: ${workStyle}
    Motivation Factors: ${motivationFactors.join(', ')}
    Average Tasks Per Week: ${averageTasksPerWeek}
    Common Projects: ${commonProjects.join(', ')}
    Productivity Peaks: ${productivityPeaks.join(', ')}

    Please provide:
    1. A summary of the week's progress
    2. Insightful analysis of task patterns and productivity
    3. Personalized recommendations for improvement
    4. Encouraging messages that align with the user's motivation factors
  `;
}

export async function generateWeeklyAnalysis(
  tasks: Task[], 
  userContext: UserContext
): Promise<WeeklyAnalysis> {
  try {
    const weeklyData = aggregateWeeklyData(tasks);
    const prompt = generatePrompt(weeklyData, userContext);
    const aiResponse = await getClaudeAnalysis(prompt);

    // Parse AI response into sections
    const sections = aiResponse.split('\n\n');
    
    const analysis: WeeklyAnalysis = {
      summary: sections[0] || 'No summary available',
      insights: sections[1] || 'No insights available',
      recommendations: sections[2] || 'No recommendations available',
    };

    return analysis;
  } catch (error) {
    console.error('Error generating weekly analysis:', error);
    throw new Error('Failed to generate weekly analysis');
  }
}

// Utility function for testing
export function _internal_aggregateWeeklyData(tasks: Task[]): string {
  return aggregateWeeklyData(tasks);
}