// src/components/insights/components/LoadingOverlay.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from 'lucide-react';
import { LoadingStage } from '../types';

interface LoadingOverlayProps {
  stage: LoadingStage | null;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ stage }) => {
  if (!stage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Loader className="w-12 h-12 animate-spin text-blue-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {stage.stage}
            </h3>
            
            <p className="text-gray-600 mb-6">{stage.detail}</p>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stage.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <span className="text-sm text-gray-500">
              {stage.progress}% Complete
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingOverlay;