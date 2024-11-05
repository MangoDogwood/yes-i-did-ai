import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';
import { Achievement } from '../types';
import { AchievementCard } from './AchievementCard';

interface AchievementListProps {
  achievements: Achievement[];
}

export const AchievementList: React.FC<AchievementListProps> = ({ achievements }) => {
  if (!achievements.length) {
    return (
      <motion.div 
        className="text-center py-8 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No achievements recorded yet. Complete some tasks to earn achievements!</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
          >
            <AchievementCard achievement={achievement} />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};

export default AchievementList;