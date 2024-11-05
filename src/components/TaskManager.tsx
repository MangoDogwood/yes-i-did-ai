// src/components/TaskManager.tsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addTask, deleteTask } from '../store/tasksSlice';
import type { Task } from '../store/tasksSlice';
import VoiceInput from './VoiceInput';
import { Trash2, Calendar, Star } from 'lucide-react';

interface TaskManagerProps {
  project: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ project }) => {
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  
  const tasks = useSelector((state: RootState) => 
    state.tasks.tasks.filter(task => task.project === project)
  );

  const createNewTask = (text: string): Task => ({
    id: Date.now(),
    text,
    title: text,
    completed: false,
    project,
    priority: 'medium',
    summary: text.slice(0, 100),
    description: text, // Added this
    dueDate: null,
    tags: [],
    subtasks: [],
    completedAt: null,
    completedInWeek: null,
    completedInMonth: null,
    completedInYear: null,
    archived: false,
    createdAt: new Date().toISOString() // Added this
  });
  
  // Load tasks from local storage on component mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(`yesIdidAI_tasks_${project}`);
      if (storedTasks) {
        const parsedTasks: Task[] = JSON.parse(storedTasks);
        const projectTasks = parsedTasks.filter(task => task.project === project);
        projectTasks.forEach(task => {
          dispatch(addTask(task));
        });
      }
    } catch (err) {
      setError('Failed to load tasks from storage');
      console.error('Error loading tasks:', err);
    }
  }, [dispatch, project]);

  // Save tasks to local storage whenever tasks change
  useEffect(() => {
    try {
      const projectTasks = tasks.filter(task => task.project === project);
      localStorage.setItem(`yesIdidAI_tasks_${project}`, JSON.stringify(projectTasks));
    } catch (err) {
      setError('Failed to save tasks');
      console.error('Error saving tasks:', err);
    }
  }, [tasks, project]);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask = createNewTask(newTaskTitle);
      
      try {
        dispatch(addTask(newTask));
        setNewTaskTitle('');
        setError(null);
      } catch (err) {
        setError('Failed to add task');
        console.error('Error adding task:', err);
      }
    }
  };

  const handleDeleteTask = (taskId: number) => {
    try {
      dispatch(deleteTask(taskId));
      setError(null);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
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

  return (
    <div className="task-manager-container p-4">
      <div className="flex flex-col space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Task list */}
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li 
              key={task.id} 
              className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex-grow">
                {/* Task Text and Description */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {
                      // Handle completion toggle here if needed
                    }}
                    className="mt-1"
                  />
                  <div>
                    <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.text}
                    </span>
                    {task.description && (
                      <p className="text-sm text-gray-500">{task.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Due Date */}
                {task.dueDate && (
                  <div className="flex items-center text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span className="text-xs">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Priority Badge */}
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>

                {/* Delete Button */}
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors duration-200"
                  aria-label="Delete task"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Task input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          />
          <button 
            onClick={() => setShowVoiceInput(!showVoiceInput)}
            className={`p-2 rounded-lg ${
              showVoiceInput ? 'bg-red-500' : 'bg-blue-500'
            } text-white transition-colors duration-200 hover:opacity-90`}
          >
            {showVoiceInput ? 'Hide Voice' : 'Voice Input'}
          </button>
        </div>

        {/* Voice input component */}
        {showVoiceInput && (
          <VoiceInput 
            onClose={() => setShowVoiceInput(false)}
            onError={setError}
          />
        )}
      </div>
    </div>
  );
};

export default TaskManager;