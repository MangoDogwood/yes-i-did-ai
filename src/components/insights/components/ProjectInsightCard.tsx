// src/components/insights/components/ProjectInsightCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle, 
  CheckCircle2, 
  Plus,
  Flag
} from 'lucide-react';
import { ProjectInsight } from '../types';

interface ProjectInsightCardProps {
  insight: ProjectInsight;
  onAddTask?: (task: string) => void;
  className?: string;
}

export const ProjectInsightCard: React.FC<ProjectInsightCardProps> = ({
  insight,
  onAddTask,
  className = ''
}) => {
  const getTrendIcon = () => {
    switch (insight.trending) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (insight.priority) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50';
      case 'low':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-900">
            {insight.projectName}
          </h3>
          <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor()}`}>
            {insight.priority}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          {insight.completionRate !== undefined && (
            <span className="text-sm font-medium">
              {insight.completionRate}% complete
            </span>
          )}
        </div>
      </div>

      {/* Progress and Analysis */}
      <div className="space-y-4 mb-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
          <p className="text-gray-600">{insight.progress}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis</h4>
          <p className="text-gray-600">{insight.analysis}</p>
        </div>
      </div>

      {/* Challenges and Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className="font-medium text-red-700">Challenges</h4>
          </div>
          <p className="text-red-600 text-sm">{insight.challenges}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h4 className="font-medium text-green-700">Opportunities</h4>
          </div>
          <p className="text-green-600 text-sm">{insight.opportunities}</p>
        </div>
      </div>

      {/* Suggested Tasks */}
      {insight.suggestedTasks && insight.suggestedTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Suggested Tasks
          </h4>
          <div className="space-y-2">
            {insight.suggestedTasks.map((task, index) => (
              <div 
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <span className="text-sm text-gray-700">{task}</span>
                {onAddTask && (
                  <button
                    onClick={() => onAddTask(task)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    title="Add task"
                  >
                    <Plus className="w-5 h-5 text-blue-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectInsightCard;