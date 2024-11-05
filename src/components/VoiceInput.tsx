// src/components/VoiceInput.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addTask } from '../store/tasksSlice';
import type { Task } from '../store/tasksSlice';
import { 
  Mic, 
  MicOff, 
  Loader, 
  Calendar, 
  AlertCircle,
  Check,
  Flag,
  Folder,
  X,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Speech Recognition Types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type SpeechRecognitionResult = {
  isFinal: boolean;
  readonly length: number;
} & {
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  emma: Document | null;
  interpretation: any;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Component Types
interface VoiceInputProps {
  onClose?: () => void;
  onError?: (error: string | null) => void;
}

interface TaskDetails {
  text: string;
  description: string;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
  project: string;
  summary: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onClose, onError }) => {
  const dispatch = useDispatch();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractedTask, setExtractedTask] = useState<TaskDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  const recognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      handleError("Speech recognition is not supported in this browser.");
      return null;
    }

    const instance = new SpeechRecognition();
    instance.continuous = true;
    instance.interimResults = true;
    instance.maxAlternatives = 1;
    instance.lang = 'en-US';

    instance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0]?.transcript || '')
        .join('');
      setTranscript(transcript);
    };

    instance.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error occurred. Please check your internet connection.';
          setTimeout(() => {
            if (isListening) {
              try {
                instance.start();
              } catch (err) {
                console.error('Reconnection attempt failed:', err);
              }
            }
          }, 1000);
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access was denied. Please allow microphone access to use voice input.';
          break;
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.';
          break;
        case 'aborted':
          errorMessage = 'Speech input was aborted. Please try again.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      handleError(errorMessage);
      setIsListening(false);
    };

    return instance;
  }, [isListening, handleError]);

  useEffect(() => {
    const recognitionInstance = recognition();
    if (!recognitionInstance) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        try {
          recognitionInstance.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      } else if (isListening) {
        try {
          recognitionInstance.start();
        } catch (err) {
          console.error('Error restarting recognition:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (isListening) {
      try {
        recognitionInstance.start();
      } catch (err) {
        console.error('Recognition start error:', err);
        handleError('Failed to start speech recognition');
      }
    } else {
      try {
        recognitionInstance.stop();
      } catch (err) {
        console.error('Recognition stop error:', err);
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      try {
        recognitionInstance.stop();
      } catch (err) {
        console.error('Recognition cleanup error:', err);
      }
    };
  }, [isListening, recognition, handleError]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClose = () => {
    setIsListening(false);
    setTranscript('');
    setExtractedTask(null);
    setError(null);
    onClose?.();
  };

  const toggleListening = () => {
    if (!isOnline) {
      handleError('Cannot record while offline');
      return;
    }
    setIsListening(!isListening);
    setError(null);
  };

  const extractTaskDetails = (text: string): TaskDetails => {
    const lowercaseText = text.toLowerCase();
    const words = lowercaseText.split(' ');

    let taskText = text;
    let description = '';
    let dueDate: Date | null = null;
    let priority: 'low' | 'medium' | 'high' = 'medium';
    let project = 'Default';
    let summary = '';

    // Extract due date
    const dueDateIndex = words.indexOf('due');
    if (dueDateIndex !== -1 && words[dueDateIndex + 1]) {
      const potentialDate = new Date(words.slice(dueDateIndex + 1).join(' '));
      if (!isNaN(potentialDate.getTime())) {
        dueDate = potentialDate;
        taskText = words.slice(0, dueDateIndex).join(' ');
      }
    }

    // Extract priority
    if (lowercaseText.includes('high priority')) {
      priority = 'high';
    } else if (lowercaseText.includes('low priority')) {
      priority = 'low';
    }

    // Extract description
    const descriptionIndex = lowercaseText.indexOf('description');
    if (descriptionIndex !== -1) {
      description = text.slice(descriptionIndex + 'description'.length).trim();
      taskText = text.slice(0, descriptionIndex).trim();
    }

    // Extract project
    const projectIndex = lowercaseText.indexOf('for project');
    if (projectIndex !== -1) {
      const projectEndIndex = lowercaseText.indexOf(' ', projectIndex + 12);
      project = text.slice(projectIndex + 12, projectEndIndex > -1 ? projectEndIndex : undefined).trim();
    }

    // Set summary
    summary = taskText.split(' ').slice(0, 5).join(' ') + '...';

    return {
      text: taskText,
      description,
      dueDate,
      priority,
      project,
      summary
    };
  };

  const handleTaskCreation = async () => {
    if (!transcript) return;
  
    setIsProcessing(true);
    try {
      const taskDetails = extractTaskDetails(transcript);
      setExtractedTask(taskDetails);
  
      const newTask: Task = {
        id: Date.now(),
        text: taskDetails.text,
        title: taskDetails.text,
        completed: false,
        project: taskDetails.project,
        priority: taskDetails.priority,
        summary: taskDetails.summary,
        description: taskDetails.description,
        dueDate: taskDetails.dueDate?.toISOString() || null,
        tags: [],
        subtasks: [],
        completedAt: null,
        completedInWeek: null,
        completedInMonth: null,
        completedInYear: null,
        archived: false,
        createdAt: new Date().toISOString() // Added this line
      };
  
      dispatch(addTask(newTask));
      setTranscript('');
      setIsListening(false);
      setExtractedTask(null);
    } catch (err) {
      handleError('Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setIsProcessing(false);
    }
  };  

  const formatDate = (date: Date | null): string => {
    if (!date) return 'No date set';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="voice-input-container p-6 bg-white rounded-lg shadow-lg relative">
      {/* Network Status */}
      <div className={`absolute top-2 right-2 flex items-center ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
        <span className="text-xs">{isOnline ? 'Connected' : 'Offline'}</span>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close voice input"
        >
          <X size={20} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Voice Input</h2>
          <button 
            className="text-gray-400 hover:text-gray-600"
            title="Say your task, optionally including 'due [date]', 'high/low priority', 'description [text]', or 'for project [name]'"
          >
            <Info size={16} />
          </button>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          disabled={!isOnline}
          className={`p-4 rounded-full ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {/* Listening Indicator */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <div className="relative">
                <Loader className="animate-spin" size={24} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
              <span className="text-blue-700 font-medium">Listening...</span>
            </div>
          </motion.div>
        )}

        {/* Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4"
          >
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Transcript</h3>
              <p className="text-gray-600">{transcript}</p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => void handleTaskCreation()}
                disabled={isProcessing}
                className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow 
                         transition-colors duration-200 flex items-center justify-center space-x-2 
                         disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isProcessing ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <Check size={18} />
                )}
                <span>{isProcessing ? 'Processing...' : 'Create Task'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
{/* Error Message */}
{error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Task Preview */}
        {extractedTask && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 bg-white rounded-lg shadow-lg p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Task Preview
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Task</p>
                  <p className="text-gray-600">{extractedTask.text}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Description</p>
                  <p className="text-gray-600">
                    {extractedTask.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Due Date</p>
                  <p className="text-gray-600">
                    {formatDate(extractedTask.dueDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Flag className={`w-5 h-5 ${getPriorityColor(extractedTask.priority)} mt-1`} />
                <div>
                  <p className="font-medium text-gray-700">Priority</p>
                  <p className={`capitalize ${getPriorityColor(extractedTask.priority)}`}>
                    {extractedTask.priority}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Folder className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Project</p>
                  <p className="text-gray-600">{extractedTask.project}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-500">
        <p>Try saying something like:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>"Create a task to review project documents due next Monday"</li>
          <li>"High priority task to prepare presentation for project Marketing"</li>
          <li>"Write blog post description This is the content of the blog"</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceInput;