export interface Task {
  id: number;
  text: string;
  completed: boolean;
  project: string;
  priority: 'low' | 'medium' | 'high';
  summary: string;
  dueDate: string | null;
  tags: string[];
  subtasks: Task[];
  completedAt: string | null;
  completedInWeek: number | null;
  completedInMonth: number | null;
  completedInYear: number | null;
  archived: boolean;
}

export const createTask = (
  text: string,
  project: string,
  priority: 'low' | 'medium' | 'high'
): Task => ({
  id: Date.now(),
  text,
  completed: false,
  project,
  priority,
  summary: '',
  dueDate: null,
  tags: [],
  subtasks: [],
  completedAt: null,
  completedInWeek: null,
  completedInMonth: null,
  completedInYear: null,
  archived: false
});