import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Mic,
  Award,
  Settings,
  X
} from 'lucide-react';
import { 
  addTask, 
  updateTask,
  deleteTask,
  setTasks,
  reorderTasks,
} from './store/tasksSlice';
import type { RootState } from './store';
import type { Task } from './store/tasksSlice';
import { Button } from './components/ui/button';
import VoiceInput from './components/VoiceInput';
import InsightsTab from './components/insights/InsightsTab';
import { analytics } from './utils/analytics';

interface TaskInputProps {
  onAddTask: (task: string, project: string, priority: string) => void;
  existingProjects: string[];
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, existingProjects }) => {
  const [newTask, setNewTask] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask, newProject, newPriority);
      setNewTask('');
      setNewProject('');
      setNewPriority('medium');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 border rounded"
        />
        <select
          value={newProject}
          onChange={(e) => {
            setNewProject(e.target.value);
            setShowNewProjectInput(e.target.value === 'new');
          }}
          className="p-2 border rounded"
        >
          <option value="">Select Project</option>
          {existingProjects.map(project => (
            <option key={project} value={project}>{project}</option>
          ))}
          <option value="new">New Project</option>
        </select>
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="p-2 border rounded"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      {showNewProjectInput && (
        <input
          type="text"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          placeholder="Enter new project name..."
          className="w-full p-2 border rounded"
        />
      )}
      <Button type="submit" disabled={!newTask.trim()}>
        Add Task
      </Button>
    </form>
  );
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highPriorityFilter, setHighPriorityFilter] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('yesIdidAI_tasks');
    if (savedTasks) {
      dispatch(setTasks(JSON.parse(savedTasks)));
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('yesIdidAI_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (text: string, project: string, priority: string) => {
    const newTask: Task = {
      id: Date.now(),
      text,
      title: text,
      completed: false,
      project,
      priority: priority as 'low' | 'medium' | 'high',
      summary: text.slice(0, 100),
      description: text,
      dueDate: null,
      tags: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      completedAt: null,
      completedInWeek: null,
      completedInMonth: null,
      completedInYear: null,
      archived: false
    };

    dispatch(addTask(newTask));
    analytics.track('task_added', { project, priority });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) {
      return;
    }

    const taskToMove = tasks.find(task => task.id.toString() === draggableId);
    if (!taskToMove) return;

    const newTasks = [...tasks];
    const [removed] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, removed);

    if (source.droppableId !== destination.droppableId) {
      const [destProject] = destination.droppableId.split(':');
      const updatedTask = { ...taskToMove, project: destProject };
      dispatch(updateTask(updatedTask));
    }

    dispatch(reorderTasks(newTasks));
    analytics.track('task_reordered', {
      fromIndex: source.index,
      toIndex: destination.index,
      project: taskToMove.project
    });
  };

  const projects = Array.from(new Set(tasks.map(task => task.project)));
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const priorityBadges = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const handleDeleteTask = (taskId: number) => {
    dispatch(deleteTask(taskId));
    analytics.track('task_deleted', { taskId });
  };

  const handleToggleProject = (project: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [project]: !prev[project]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setHighPriorityFilter(!highPriorityFilter)}
              >
                High Priority Only
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowVoiceInput(true)}
              >
                <Mic className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <TaskInput 
            onAddTask={handleAddTask}
            existingProjects={projects}
          />

          <AnimatePresence>
            {showVoiceInput && (
              <VoiceInput 
                onClose={() => setShowVoiceInput(false)}
                onError={setError}
              />
            )}
          </AnimatePresence>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="space-y-4">
            {projects.map(project => (
              <motion.div 
                key={project}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div 
                  className="bg-white p-4 rounded-lg shadow-sm cursor-pointer"
                  onClick={() => handleToggleProject(project)}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center">
                      {project}
                      <span className="ml-2 text-sm text-gray-500">
                        ({tasks.filter(t => t.project === project && !t.completed).length} tasks)
                      </span>
                    </h2>
                    {expandedProjects[project] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedProjects[project] && (
                    <Droppable droppableId={`${project}`}>
                      {(provided) => (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 space-y-2"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {tasks
                            .filter(task => 
                              task.project === project && 
                              !task.completed &&
                              (!highPriorityFilter || task.priority === 'high')
                            )
                            .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
                            .map((task, index) => (
                              <Draggable 
                                key={task.id} 
                                draggableId={task.id.toString()} 
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-white p-4 rounded-lg shadow-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-800">{task.text}</span>
                                      <div className="flex items-center space-x-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityBadges[task.priority]}`}>
                                          {task.priority}
                                        </span>
                                        <button
                                          onClick={() => handleDeleteTask(task.id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </motion.div>
                      )}
                    </Droppable>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default App;