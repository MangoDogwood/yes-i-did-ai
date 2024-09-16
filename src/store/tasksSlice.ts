import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  project: string;
  priority: 'low' | 'medium' | 'high';
  summary: string;
  completedDate?: string;
}

interface TasksState {
  tasks: Task[];
  streak: { count: number; lastUpdated: string };
}

const initialState: TasksState = {
  tasks: [],
  streak: { count: 0, lastUpdated: new Date().toISOString() },
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    toggleTask: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        if (task.completed) {
          task.completedDate = new Date().toISOString();

          // Update streak if task is completed on a new day
          const today = new Date().toDateString();
          const lastUpdated = new Date(state.streak.lastUpdated).toDateString();
          if (today !== lastUpdated) {
            state.streak.count += 1;
            state.streak.lastUpdated = new Date().toISOString();
          }
        } else {
          task.completedDate = undefined;
          task.summary = '';
        }
      }
    },
    editTask: (state, action: PayloadAction<{ id: number; text: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.text = action.payload.text;
      }
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    addTaskSummary: (state, action: PayloadAction<{ id: number; summary: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.summary = action.payload.summary;
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.project !== action.payload);
    },
    clearCompletedTasks: (state) => {
      state.tasks = state.tasks.filter(task => !task.completed);
    },
  },
});

export const { 
  addTask, 
  toggleTask, 
  editTask, 
  deleteTask, 
  addTaskSummary, 
  deleteProject, 
  clearCompletedTasks 
} = tasksSlice.actions;

export default tasksSlice.reducer;
