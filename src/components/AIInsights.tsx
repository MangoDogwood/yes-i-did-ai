import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Task } from '../store/tasksSlice';
import { getClaudeAnalysis } from '../utils/claudeApiClient';
import { getCachedData, setCachedData } from '../utils/apiCache';

const AIInsights: React.FC = () => {
  const { tasks, streak } = useSelector((state: RootState) => state.tasks);
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateInsights();
  }, [tasks, streak]);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);

    if (!process.env.REACT_APP_CLAUDE_API_KEY) {
      setError('Claude API key is not set. Please check your environment variables.');
      setIsLoading(false);
      return;
    }

    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    
    const cacheKey = `insights_${tasks.length}_${completedTasks.length}_${streak.count}`;
    const cachedInsights = getCachedData(cacheKey);

    if (cachedInsights) {
      setInsights(cachedInsights);
      setIsLoading(false);
      return;
    }

    const completionRate = (completedTasks.length / tasks.length * 100).toFixed(2);
    
    const priorityDistribution = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length
    };
    
    const projectProgress: {[key: string]: {total: number, completed: number}} = {};
    tasks.forEach(task => {
      if (!projectProgress[task.project]) {
        projectProgress[task.project] = { total: 0, completed: 0 };
      }
      projectProgress[task.project].total++;
      if (task.completed) {
        projectProgress[task.project].completed++;
      }
    });

    const prompt = `
      As an advanced AI assistant specializing in productivity and task management, analyze the following data and provide deep, insightful feedback:

      Task Management Overview:
      - Total tasks: ${tasks.length}
      - Completed tasks: ${completedTasks.length}
      - Pending tasks: ${pendingTasks.length}
      - Completion rate: ${completionRate}%
      - Current streak: ${streak.count} days

      Priority Distribution:
      - High: ${priorityDistribution.high}
      - Medium: ${priorityDistribution.medium}
      - Low: ${priorityDistribution.low}

      Project Progress:
      ${Object.entries(projectProgress).map(([project, progress]) => {
        const percentage = (progress.completed / progress.total * 100).toFixed(2);
        return `- ${project}: ${progress.completed}/${progress.total} tasks completed (${percentage}%)`;
      }).join('\n')}

      High Priority Pending Tasks:
      ${pendingTasks.filter(task => task.priority === 'high').map(task => `- ${task.text} (${task.project})`).join('\n')}

      Based on this data, please provide:

      1. A comprehensive analysis of the user's productivity patterns
      2. Detailed recommendations for improvement
      3. Personalized motivational insights
      4. Long-term productivity strategies

      Please format your response in Markdown, using headers, bullet points, and emphasis where appropriate to enhance readability.
    `;

    try {
      const analysis = await getClaudeAnalysis(prompt);
      setInsights(analysis);
      setCachedData(cacheKey, analysis);
    } catch (err) {
      console.error('Detailed error:', err);
      if (err instanceof Error) {
        setError(`Failed to generate insights: ${err.message}`);
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = <div>Loading insights...</div>;
  } else if (error) {
    content = <div className="text-red-500">{error}</div>;
  } else if (insights) {
    content = <div className="prose" dangerouslySetInnerHTML={{ __html: insights }} />;
  } else {
    content = <div>No insights available.</div>;
  }

  return (
    <div className="mt-4 p-4 bg-white rounded shadow-sm">
      <h3 className="font-semibold mb-2">AI Insights</h3>
      {content}
    </div>
  );
};

export default AIInsights;