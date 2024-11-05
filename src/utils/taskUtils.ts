// src/utils/taskUtils.ts

import { now } from 'mongoose';
import { Task } from '../types';

export const createNewTask = (title: string, partial: Partial<Task> = {}): Task => {
    const now = new Date().toISOString();
    
    return {
      id: Date.now(),
      text: title,
      title: title,
      completed: false,
      project: 'Default',
      priority: 'medium',
      summary: title.slice(0, 100),
      description: '',
      dueDate: null,
      createdAt: now,          // Add this
      tags: [],
      subtasks: [],
      completedAt: null,
      completedInWeek: 0,
      completedInMonth: 0,
      completedInYear: 0,
      archived: false,
      ...partial
    };
  };
    
export const isTaskCompleted = (task: Task): boolean => {
        return Boolean(task.completedAt);
      };

export const getTaskPriorityClass = (priority: Task['priority']): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};