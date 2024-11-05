// src/components/insights/components/AchievementCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Trophy, Star } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement,
  className = ''
}) => {
  // Use custom timestamp for display if available
  const displayTime = achievement.unlockedAt 
    ? formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })
    : 'Not yet unlocked';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-md p-4 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {achievement.unlockedAt ? (
            <Trophy className="w-8 h-8 text-yellow-500" />
          ) : (
            <Trophy className="w-8 h-8 text-gray-300" />
          )}
        </div>
        
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900">
            {achievement.name || achievement.title}
          </h3>
          
          <p className="text-sm text-gray-600 mt-1">
            {achievement.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>Threshold: {achievement.threshold}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className={achievement.unlockedAt ? 'text-green-600' : 'text-gray-400'}>
                {displayTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementCard;