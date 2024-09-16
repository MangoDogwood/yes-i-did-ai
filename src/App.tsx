import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { 
  addTask, 
  toggleTask, 
  editTask, 
  deleteTask, 
  addTaskSummary, 
  deleteProject, 
  clearCompletedTasks,
  Task 
} from './store/tasksSlice';
import { PlusCircle, Edit2, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import AIInsights from './components/AIInsights';
import VoiceInput from './components/VoiceInput';
import WeeklyAIAnalysis from './components/WeeklyAIAnalysis';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { tasks, streak } = useSelector((state: RootState) => state.tasks);
  const [newTask, setNewTask] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [expandedProjects, setExpandedProjects] = useState<{[key: string]: boolean}>({});
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskSummary, setTaskSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const handleAddTask = () => {
    if (newTask.trim() && newProject.trim()) {
      dispatch(addTask({
        id: Date.now(),
        text: newTask,
        completed: false,
        project: newProject,
        priority: newPriority,
        summary: ''
      }));
      setNewTask('');
      setNewProject('');
      setNewPriority('medium');
      setError(null);
    } else {
      setError('Please enter both a task name and a project.');
    }
  };

  const handleClearCompleted = () => {
    if (window.confirm('Are you sure you want to clear all completed tasks?')) {
      dispatch(clearCompletedTasks());
    }
  };

  const handleGenerateInsights = () => {
    setIsGeneratingInsights(true);
    setTimeout(() => {
      setIsGeneratingInsights(false);
    }, 1500);
  };

  const handleToggleTask = (task: Task) => {
    if (!task.completed) {
      setCurrentTask(task);
      setShowSummaryModal(true);
    } else {
      dispatch(toggleTask(task.id));
    }
  };

  const handleEditTask = (id: number, newText: string) => {
    dispatch(editTask({ id, text: newText }));
    setEditingTaskId(null);
  };

  const handleDeleteProject = (project: string) => {
    if (window.confirm(`Are you sure you want to delete the project "${project}" and all its tasks?`)) {
      dispatch(deleteProject(project));
    }
  };

  const projects = [...new Set(tasks.map(task => task.project))];

  const priorityClasses = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Yes I Did AI</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1 rounded text-sm ${activeTab === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1 rounded text-sm ${activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Completed
          </button>
        </div>
        <div className="text-sm font-semibold">Streak: {streak.count} days 🔥</div>
      </div>

      {projects.map(project => (
        <div key={project} className="mb-4 border rounded">
          <div className="bg-gray-100 p-2 flex justify-between items-center">
            <h2 className="font-semibold">{project}</h2>
            <div className="flex items-center">
              <button 
                onClick={() => setExpandedProjects(prev => ({ ...prev, [project]: !prev[project] }))}
                className="mr-2"
              >
                {expandedProjects[project] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button 
                onClick={() => handleDeleteProject(project)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {expandedProjects[project] && (
            <ul className="p-2">
              {tasks
                .filter(task => task.project === project && (activeTab === 'active' ? !task.completed : task.completed))
                .map(task => (
                  <li key={task.id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center flex-grow">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task)}
                        className="mr-2"
                      />
                      {editingTaskId === task.id ? (
                        <input
                          type="text"
                          value={task.text}
                          onChange={(e) => handleEditTask(task.id, e.target.value)}
                          onBlur={() => setEditingTaskId(null)}
                          className="flex-grow p-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <span className={task.completed ? 'line-through flex-grow' : 'flex-grow'}>
                          {task.text}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded text-xs ${priorityClasses[task.priority]}`}>
                        {task.priority}
                      </span>
                      <button 
                        onClick={() => setEditingTaskId(task.id)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => dispatch(deleteTask(task.id))}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}

      <div className="mt-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          placeholder="Project"
          className="w-full p-2 mb-2 border rounded"
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="w-full p-2 mb-2 border rounded"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <div className="flex space-x-2">
          <button 
            onClick={handleAddTask}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 flex items-center justify-center"
          >
            <PlusCircle className="mr-2" size={20} />
            Add Task
          </button>
          <VoiceInput />
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {activeTab === 'completed' && (
        <button
          onClick={handleClearCompleted}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200 flex items-center justify-center"
        >
          <RefreshCw className="mr-2" size={20} />
          Clear Completed Tasks
        </button>
      )}

      {showSummaryModal && currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Task Completed</h2>
            <p className="mb-4">Great job completing "{currentTask.text}"! What did you accomplish?</p>
            <textarea
              value={taskSummary}
              onChange={(e) => setTaskSummary(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              rows={3}
              placeholder="Enter a brief summary of your accomplishment..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch(toggleTask(currentTask.id));
                  dispatch(addTaskSummary({ id: currentTask.id, summary: taskSummary }));
                  setShowSummaryModal(false);
                  setTaskSummary('');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleGenerateInsights}
          className="mb-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-200 flex items-center justify-center"
          disabled={isGeneratingInsights}
        >
          {isGeneratingInsights ? 'Generating...' : 'Generate AI Insights'}
        </button>
        {isGeneratingInsights ? (
          <div className="text-center">Loading insights...</div>
        ) : (
          <AIInsights />
        )}
      </div>

      <WeeklyAIAnalysis />
    </div>
  );
};

export default App;