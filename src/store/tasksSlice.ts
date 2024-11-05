import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: number;
  text: string;
  title?: string;
  completed: boolean;
  project: string;
  priority: 'low' | 'medium' | 'high';
  summary: string;
  description?: string;
  dueDate: string | null;
  tags: string[];
  subtasks: Task[];
  createdAt: string; // Added to match types/index.ts
  completedAt: string | null;
  completedInWeek: number | null;
  completedInMonth: number | null;
  completedInYear: number | null;
  archived: boolean;
  // Additional fields for insights integration
  progress?: number;
  focusTime?: number;
  productivityScore?: number;
}

export interface Achievement {
  id: string;
  name: string; // Added to match types/index.ts
  title: string;
  description: string;
  threshold: number;
  unlockedAt?: string;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  streak: {
    count: number;
    lastUpdate: string;
    longestStreak: number; // Added to match your streak display
    milestones: Record<number, boolean>;
  };
  achievements: Achievement[];
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  lastUpdated: null,
  streak: {
    count: 0,
    lastUpdate: new Date().toISOString(),
    longestStreak: 0,
    milestones: {}
  },
  achievements: []
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload.map(task => ({
        ...task,
        createdAt: task.createdAt || new Date().toISOString() // Ensure createdAt exists
      }));
      state.lastUpdated = new Date().toISOString();
    },
    addTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt' | 'completedAt'>>) => {
      const newTask: Task = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        completedAt: null,
        completedInWeek: null,
        completedInMonth: null,
        completedInYear: null,
        archived: false,
        subtasks: [],
        tags: action.payload.tags || []
      };
      state.tasks.push(newTask);
      state.lastUpdated = new Date().toISOString();
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = {
          ...action.payload,
          createdAt: state.tasks[index].createdAt // Preserve original createdAt
        };
        state.lastUpdated = new Date().toISOString();
      }
    },
    toggleTask: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        if (task.completed) {
          const now = new Date();
          task.completedInWeek = now.getDay();
          task.completedInMonth = now.getDate();
          task.completedInYear = now.getMonth();
        } else {
          task.completedInWeek = null;
          task.completedInMonth = null;
          task.completedInYear = null;
        }
        state.lastUpdated = new Date().toISOString();
      }
    },
    editTask: (state, action: PayloadAction<{ id: number; updates: Partial<Task> }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        Object.assign(task, {
          ...action.payload.updates,
          createdAt: task.createdAt // Preserve original createdAt
        });
        state.lastUpdated = new Date().toISOString();
      }
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.project !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    clearCompletedTasks: (state) => {
      state.tasks = state.tasks.filter(task => !task.completed);
      state.lastUpdated = new Date().toISOString();
    },
    addTaskSummary: (state, action: PayloadAction<{ id: number; summary: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.summary = action.payload.summary;
        state.lastUpdated = new Date().toISOString();
      }
    },
    reorderTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    acknowledgeAchievement: (state, action: PayloadAction<string>) => {
      const achievement = state.achievements.find(a => a.id === action.payload);
      if (achievement && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date().toISOString();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateStreak: (state, action: PayloadAction<{ 
      count: number; 
      lastUpdate: string;
      longestStreak?: number;
    }>) => {
      state.streak.count = action.payload.count;
      state.streak.lastUpdate = action.payload.lastUpdate;
      if (action.payload.longestStreak !== undefined) {
        state.streak.longestStreak = action.payload.longestStreak;
      }
      // Update longest streak if current streak is longer
      if (state.streak.count > state.streak.longestStreak) {
        state.streak.longestStreak = state.streak.count;
      }
    },
    unlockMilestone: (state, action: PayloadAction<number>) => {
      state.streak.milestones[action.payload] = true;
    }
  }
});

export const {
  setTasks,
  addTask,
  updateTask,
  toggleTask,
  editTask,
  deleteTask,
  deleteProject,
  clearCompletedTasks,
  addTaskSummary,
  reorderTasks,
  acknowledgeAchievement,
  setLoading,
  setError,
  updateStreak,
  unlockMilestone
} = tasksSlice.actions;

export default tasksSlice.reducer;