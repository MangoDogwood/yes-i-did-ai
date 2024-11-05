import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useTasks = () => {
  const tasks = useAppSelector(state => state.tasks.tasks);
  const loading = useAppSelector(state => state.tasks.loading);
  const error = useAppSelector(state => state.tasks.error);
  const lastUpdated = useAppSelector(state => state.tasks.lastUpdated);

  return {
    tasks,
    loading,
    error,
    lastUpdated,
  };
};

export const useTasksByProject = (projectName: string) => {
  const tasks = useAppSelector(state => 
    state.tasks.tasks.filter(task => task.project === projectName)
  );

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
      : 0,
  };

  return { tasks, stats };
};

export const useTaskMetrics = () => {
  const tasks = useAppSelector(state => state.tasks.tasks);
  
  const metrics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
      : 0,
    activeProjects: new Set(tasks.map(t => t.project)).size,
    highPriorityTasks: tasks.filter(t => t.priority === 'high' && !t.completed).length,
  };

  return metrics;
};