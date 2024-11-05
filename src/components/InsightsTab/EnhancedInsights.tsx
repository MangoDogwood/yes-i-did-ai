import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Task } from '../../store/tasksSlice';
import { ProfileState } from '../../store/profileSlice';
import { 
  Brain, 
  Target, 
  Clock, 
  Zap, 
  TrendingUp,
  Calendar,
  Coffee,
  Focus,
  LineChart,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GoalType = 'productivity' | 'organization' | 'work-life' | 'focus' | 'stress' | 'growth';

interface InsightCard {
  id: string;
  type: 'productivity' | 'goal' | 'habit' | 'suggestion';
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface TaskStats {
  total: number;
  completed: number;
  highPriority: {
    completed: number;
    total: number;
  };
  mediumPriority: {
    completed: number;
    total: number;
  };
  lowPriority: {
    completed: number;
    total: number;
  };
}

const EnhancedInsights: React.FC = () => {
  const profile = useSelector((state: RootState) => state.profile);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Helper functions
  const isWithinWorkingHours = (date: string | null, workingHours: { start: Date; end: Date }): boolean => {
    if (!date) return false;
    const taskDate = new Date(date);
    const taskHour = taskDate.getHours();
    return taskHour >= workingHours.start.getHours() && taskHour < workingHours.end.getHours();
  };

  const processGoalProgress = (tasks: Task[], goal: GoalType): InsightCard | null => {
    if (goal === 'productivity') {
      const completedToday = tasks.filter(task => 
        task.completed && 
        task.completedAt && 
        new Date(task.completedAt).toDateString() === new Date().toDateString()
      ).length;

      const averageCompletion = profile.stats.averageTasksPerDay;
      
      if (completedToday > averageCompletion) {
        return {
          id: `goal-${goal}`,
          type: 'goal',
          title: 'Productivity Goal Progress',
          description: `Great job! You've completed ${completedToday} tasks today, which is above your daily average of ${averageCompletion.toFixed(1)} tasks.`,
          category: 'goals',
          priority: 'medium',
          actionable: false
        };
      }
    }
    return null;
  };

  const processChallengeArea = (tasks: Task[], challenge: string): InsightCard | null => {
    switch (challenge) {
      case 'Time Management': {
        const overdueTasks = tasks.filter(task => {
          if (!task.completed && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            return !isNaN(dueDate.getTime()) && dueDate < new Date();
          }
          return false;
        }).length;
  
        if (overdueTasks > 0) {
          return {
            id: 'time-management',
            type: 'suggestion',
            title: 'Time Management Alert',
            description: `You have ${overdueTasks} overdue tasks. Based on your identified challenges, let's break these down into smaller, manageable chunks.`,
            category: 'challenges',
            priority: 'high',
            actionable: true,
            action: {
              label: 'Review Overdue Tasks',
              onClick: () => {/* Navigate to overdue tasks */}
            }
          };
        }
        break;
      }
      default:
        return null;
    }
    return null;
  };

  const checkWorkLifeBalance = (tasks: Task[], workingHours: { start: Date; end: Date }): InsightCard | null => {
    const tasksOutsideHours = tasks.filter(task => {
      if (!task.completed || !task.completedAt) return false;
      const taskDate = new Date(task.completedAt);
      const taskHour = taskDate.getHours();
      return taskHour < workingHours.start.getHours() || taskHour >= workingHours.end.getHours();
    }).length;

    if (tasksOutsideHours > 5) {
      return {
        id: 'work-life-balance',
        type: 'habit',
        title: 'Work-Life Balance Check',
        description: `You've completed ${tasksOutsideHours} tasks outside your preferred working hours this week. Consider adjusting your schedule to maintain better work-life balance.`,
        category: 'wellness',
        priority: 'medium',
        actionable: true,
        action: {
          label: 'Review Schedule',
          onClick: () => {/* Open schedule review */}
        }
      };
    }
    return null;
  };

  const generateProductivityInsights = (tasks: Task[]): InsightCard[] => {
    const productivityInsights: InsightCard[] = [];
    
    // High Priority Task Insights
    const highPriorityPending = tasks.filter(task => 
      !task.completed && task.priority === 'high'
    ).length;

    if (highPriorityPending > 0) {
      productivityInsights.push({
        id: 'high-priority-alert',
        type: 'productivity',
        title: 'High Priority Tasks',
        description: `You have ${highPriorityPending} high-priority tasks pending. Consider focusing on these first.`,
        category: 'productivity',
        priority: 'high',
        actionable: true,
        action: {
          label: 'View High Priority Tasks',
          onClick: () => {/* Navigate to filtered view */}
        }
      });
    }

    return productivityInsights;
  };

  // Main insight generation
  const generatePersonalizedInsights = () => {
    const newInsights: InsightCard[] = [];

    // Add productivity insights
    newInsights.push(...generateProductivityInsights(tasks));

    // Process each goal
    (profile.primaryGoals || []).forEach(goal => {
      const goalInsight = processGoalProgress(tasks, goal as GoalType);
      if (goalInsight) newInsights.push(goalInsight);
    });

    // Process each challenge area
    (profile.persona.challengeAreas || []).forEach(challenge => {
      const challengeInsight = processChallengeArea(tasks, challenge);
      if (challengeInsight) newInsights.push(challengeInsight);
    });

    // Check work-life balance
    const workingHours = {
      start: new Date(`2024-01-01T${profile.preferences.preferredWorkingHours.start}`),
      end: new Date(`2024-01-01T${profile.preferences.preferredWorkingHours.end}`)
    };

    const workLifeBalanceInsight = checkWorkLifeBalance(tasks, workingHours);
    if (workLifeBalanceInsight) newInsights.push(workLifeBalanceInsight);

    setInsights(newInsights);
  };

  useEffect(() => {
    generatePersonalizedInsights();
  }, [tasks, profile]);

  const categories = [
    { id: 'all', label: 'All Insights', icon: Brain },
    { id: 'productivity', label: 'Productivity', icon: Zap },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'challenges', label: 'Challenges', icon: AlertTriangle },
    { id: 'wellness', label: 'Wellness', icon: Coffee }
  ];

  const renderInsightCard = (insight: InsightCard) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white p-6 rounded-lg shadow-sm space-y-4 ${
        insight.priority === 'high' ? 'border-l-4 border-red-500' :
        insight.priority === 'medium' ? 'border-l-4 border-yellow-500' :
        'border-l-4 border-green-500'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{insight.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          insight.priority === 'high' ? 'bg-red-100 text-red-800' :
          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {insight.priority}
        </span>
      </div>
      
      <p className="text-gray-600">{insight.description}</p>
      
      {insight.actionable && insight.action && (
        <button
          onClick={insight.action.onClick}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
        >
          {insight.action.label}
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {insights
            .filter(insight => activeCategory === 'all' || insight.category === activeCategory)
            .map(insight => (
              <motion.div key={insight.id}>
                {renderInsightCard(insight)}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {insights.filter(insight => 
        activeCategory === 'all' || insight.category === activeCategory
      ).length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No insights available</h3>
          <p className="text-gray-500">Check back later for personalized insights</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedInsights;