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

async function fetchAIAnalysis(prompt: string): Promise<string> {
  // In a real implementation, this would make an API call to Claude or another AI service
  // For now, we'll simulate a response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`AI analysis based on: ${prompt}`);
    }, 1000);
  });
}

function aggregateWeeklyData(tasks: Task[]): string {
  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);
  const projects = [...new Set(tasks.map(task => task.project))];

  async function fetchAIAnalysis(prompt: string): Promise<string> {
    return await getClaudeAnalysis(prompt);
  }

  return `
    This week's summary:
    - Completed tasks: ${completedTasks.length}
    - Incomplete tasks: ${incompleteTasks.length}
    - Active projects: ${projects.join(', ')}
    - Task breakdown by priority:
      High: ${tasks.filter(t => t.priority === 'high').length}
      Medium: ${tasks.filter(t => t.priority === 'medium').length}
      Low: ${tasks.filter(t => t.priority === 'low').length}
  `;
}

function generatePrompt(weeklyData: string, userContext: UserContext): string {
  return `
    As an AI assistant, analyze the following weekly task data and user context. Provide in-depth insights, 
    recommendations, and encouraging messages tailored to the user's work style and preferences.

    Weekly Data:
    ${weeklyData}

    User Context:
    Name: ${userContext.name}
    Work Style: ${userContext.preferences.workStyle}
    Motivation Factors: ${userContext.preferences.motivationFactors.join(', ')}
    Average Tasks Per Week: ${userContext.historicalData.averageTasksPerWeek}
    Common Projects: ${userContext.historicalData.commonProjects.join(', ')}
    Productivity Peaks: ${userContext.historicalData.productivityPeaks.join(', ')}

    Please provide:
    1. A summary of the week's progress
    2. Insightful analysis of task patterns and productivity
    3. Personalized recommendations for improvement
    4. Encouraging messages that align with the user's motivation factors
  `;
}

export async function generateWeeklyAnalysis(tasks: Task[], userContext: UserContext): Promise<WeeklyAnalysis> {
  const weeklyData = aggregateWeeklyData(tasks);
  const prompt = generatePrompt(weeklyData, userContext);
  const aiResponse = await fetchAIAnalysis(prompt);

  // In a real implementation, you'd parse the AI response to extract these sections
  // For now, we'll simulate it
  const analysis: WeeklyAnalysis = {
    summary: aiResponse.substring(0, 200) + "...",
    insights: aiResponse.substring(200, 400) + "...",
    recommendations: aiResponse.substring(400, 600) + "...",
  };

  return analysis;
}