import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { LoadingStage, DailyInsight } from '../types';
import type { Task } from '../../../store/tasksSlice'; // Updated import
import { LOADING_STAGES, RETRY_CONFIG } from '../constants/insightConstants';
import { getClaudeAnalysis } from '../../../utils/claudeApiClient';
import { analytics } from '../../../utils/analytics';
import { setInsights, setLoading, setError, setStage } from '../../../store/insightsSlice';

interface InsightState {
  loading: boolean;
  error: string | null;
  stage: LoadingStage | null;
  addedTasks: Set<string>;
  insights: DailyInsight | null;
  showJourney: boolean;
  lastUpdated: string | null;
}

interface ProcessedInsights extends DailyInsight {
  timestamp: string;
  metrics: {
    tasksCompleted: number;
    completionRate: number;
    productivityScore: number;
  };
}

const generatePrompt = (tasks: Task[]): string => {
  const completedTasks = tasks.filter(t => t.completedAt);
  const totalTasks = tasks.length;
  
  return `
    Task Analysis:
    - Total Tasks: ${totalTasks}
    - Completed: ${completedTasks.length}
    - Completion Rate: ${((completedTasks.length / totalTasks) * 100).toFixed(1)}%
    
    Recent Tasks:
    ${completedTasks.slice(-5).map(t => `- ${t.title}`).join('\n')}
    
    Please analyze this data and provide JSON with:
    {
      "id": "unique-id",
      "timestamp": "ISO date",
      "overview": "Overall productivity analysis",
      "keyAchievements": [
        { "id": "1", "title": "Achievement", "description": "Details" }
      ],
      "projectInsights": [
        {
          "id": "1",
          "projectName": "Project",
          "progress": "Status",
          "analysis": "Details",
          "challenges": "Issues",
          "opportunities": "Potential improvements",
          "suggestedTasks": ["Task 1", "Task 2"]
        }
      ],
      "focusRecommendation": "What to focus on next"
    }
  `;
};

export const useInsightGeneration = (tasks: Task[]) => {
  const dispatch = useDispatch();
  const [state, setState] = useState<InsightState>({
    loading: false,
    error: null,
    stage: null,
    addedTasks: new Set<string>(),
    insights: null,
    showJourney: false,
    lastUpdated: null
  });

  const updateStage = (stageName: keyof typeof LOADING_STAGES) => {
    const stageConfig = LOADING_STAGES[stageName];
    const newStage: LoadingStage = {
      stage: stageName,
      progress: stageConfig.description.includes('Analyzing') ? 25 :
               stageConfig.description.includes('Generating') ? 50 :
               stageConfig.description.includes('Processing') ? 75 : 90,
      detail: stageConfig.description
    };

    setState(prev => ({
      ...prev,
      stage: newStage,
      lastUpdated: new Date().toISOString()
    }));
    dispatch(setStage(newStage));
  };

  const calculateProductivityScore = (tasks: Task[]): number => {
    const completedTasks = tasks.filter(t => t.completedAt);
    if (completedTasks.length === 0) return 0;

    const onTimeCompletions = completedTasks.filter(t => {
      if (!t.dueDate) return true;
      return new Date(t.completedAt!) <= new Date(t.dueDate);
    });

    const taskScore = (onTimeCompletions.length / completedTasks.length) * 100;
    const priorityBonus = completedTasks.filter(t => t.priority === 'high').length * 5;
    
    return Math.min(100, Math.round(taskScore + priorityBonus));
  };

  const generateInsights = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    let retryCount = RETRY_CONFIG.MAX_RETRIES;
    let delay = RETRY_CONFIG.INITIAL_DELAY;

    const attemptGeneration = async (): Promise<ProcessedInsights | null> => {
      try {
        updateStage('ANALYZING');
        const prompt = generatePrompt(tasks);
        
        updateStage('GENERATING');
        const response = await getClaudeAnalysis(prompt);
        
        updateStage('PROCESSING');
        let parsedData: DailyInsight;
        try {
          parsedData = JSON.parse(response);
        } catch (e) {
          console.error('Failed to parse Claude response:', e);
          throw new Error('Failed to process insights data');
        }

        const processedInsights: ProcessedInsights = {
          ...parsedData,
          timestamp: new Date().toISOString(),
          metrics: {
            tasksCompleted: tasks.filter(t => t.completedAt).length,
            completionRate: (tasks.filter(t => t.completedAt).length / Math.max(tasks.length, 1)) * 100,
            productivityScore: calculateProductivityScore(tasks)
          }
        };

        updateStage('FINALIZING');

        setState(prev => ({
          ...prev,
          loading: false,
          stage: null,
          error: null,
          insights: processedInsights,
          showJourney: true,
          lastUpdated: new Date().toISOString()
        }));

        dispatch(setInsights(processedInsights));
        analytics.track('Insights Generated', {
          tasksAnalyzed: tasks.length,
          productivityScore: processedInsights.metrics.productivityScore
        });

        return processedInsights;

      } catch (error) {
        if (retryCount > 0) {
          retryCount--;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= RETRY_CONFIG.BACKOFF_FACTOR;
          return attemptGeneration();
        }
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate insights';
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage,
          stage: null,
          lastUpdated: new Date().toISOString()
        }));
        
        analytics.track('Insights Generation Failed', { error: errorMessage });
        dispatch(setError(errorMessage));
        return null;
      }
    };

    return attemptGeneration();
  }, [tasks, dispatch]);

  return {
    state,
    generateInsights
  };
};

export default useInsightGeneration;