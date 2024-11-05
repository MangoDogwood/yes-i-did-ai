import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Award, Flame, Trophy, Target, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TaskStats {
  completed: number;
  total: number;
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

const StreakDisplay: React.FC = () => {
  const { tasks, streak, achievements } = useSelector((state: RootState) => state.tasks);
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const nextAchievement = achievements.find(a => !a.unlockedAt);

  const taskStats: TaskStats = tasks.reduce((stats, task) => {
    // Update total counts
    stats.total++;
    if (task.completed) stats.completed++;

    // Update priority-specific counts
    switch (task.priority) {
      case 'high':
        stats.highPriority.total++;
        if (task.completed) stats.highPriority.completed++;
        break;
      case 'medium':
        stats.mediumPriority.total++;
        if (task.completed) stats.mediumPriority.completed++;
        break;
      case 'low':
        stats.lowPriority.total++;
        if (task.completed) stats.lowPriority.completed++;
        break;
    }

    return stats;
  }, {
    completed: 0,
    total: 0,
    highPriority: { completed: 0, total: 0 },
    mediumPriority: { completed: 0, total: 0 },
    lowPriority: { completed: 0, total: 0 }
  });

  const getCompletionPercentage = (completed: number, total: number): number => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getStreakEmoji = (count: number) => {
    if (count >= 30) return '🔥🔥🔥';
    if (count >= 7) return '🔥🔥';
    if (count >= 3) return '🔥';
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
      {/* Current Streak Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Flame className="w-6 h-6 text-orange-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
            <p className="text-2xl font-bold text-gray-900">
              {streak.count} days {getStreakEmoji(streak.count)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Longest Streak</p>
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">
              {streak?.longestStreak ?? streak.count} days
            </span>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-600">Overall Progress</h3>
          <span className="text-sm font-semibold">
            {taskStats.completed}/{taskStats.total} Tasks
          </span>
        </div>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
            <div
              style={{ width: `${getCompletionPercentage(taskStats.completed, taskStats.total)}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Priority-based Progress */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">High Priority</span>
            </div>
            <span className="text-sm">
              {taskStats.highPriority.completed}/{taskStats.highPriority.total}
            </span>
          </div>
          <div className="relative h-2 w-full bg-red-100 rounded">
            <div
              className="absolute h-full bg-red-500 rounded transition-all duration-500"
              style={{ width: `${getCompletionPercentage(taskStats.highPriority.completed, taskStats.highPriority.total)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Medium Priority</span>
            </div>
            <span className="text-sm">
              {taskStats.mediumPriority.completed}/{taskStats.mediumPriority.total}
            </span>
          </div>
          <div className="relative h-2 w-full bg-yellow-100 rounded">
            <div
              className="absolute h-full bg-yellow-500 rounded transition-all duration-500"
              style={{ width: `${getCompletionPercentage(taskStats.mediumPriority.completed, taskStats.mediumPriority.total)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Low Priority</span>
            </div>
            <span className="text-sm">
              {taskStats.lowPriority.completed}/{taskStats.lowPriority.total}
            </span>
          </div>
          <div className="relative h-2 w-full bg-green-100 rounded">
            <div
              className="absolute h-full bg-green-500 rounded transition-all duration-500"
              style={{ width: `${getCompletionPercentage(taskStats.lowPriority.completed, taskStats.lowPriority.total)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Recent Achievements</h4>
          <div className="space-y-2">
            {unlockedAchievements.slice(-2).map(achievement => (
              <div
                key={achievement.id}
                className="flex items-center space-x-2 text-sm p-2 bg-green-50 rounded-md"
              >
                <Award className="w-4 h-4 text-green-500" />
                <span className="font-medium">{achievement.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;