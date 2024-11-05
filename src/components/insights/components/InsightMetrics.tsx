import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { InsightMetrics as InsightMetricsType } from '../types/metricTypes';

interface Props {
  metrics: InsightMetricsType;
}

export const InsightMetrics: React.FC<Props> = ({ metrics }) => {
  const formatChartData = () => {
    if (!metrics.trendsData) return [];
    return metrics.trendsData.daily.map((value, index) => ({
      date: metrics.trendsData?.labels[index],
      value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <motion.div 
          className="bg-blue-50 p-4 rounded-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-2xl font-bold text-blue-600">
            {metrics.tasksCompleted}
          </div>
          <div className="text-sm text-gray-600">Tasks Completed</div>
        </motion.div>
        
        <motion.div 
          className="bg-green-50 p-4 rounded-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-2xl font-bold text-green-600">
            {metrics.completionRate}%
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </motion.div>
        
        <motion.div 
          className="bg-purple-50 p-4 rounded-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-purple-600">
            {metrics.productivityScore}/100
          </div>
          <div className="text-sm text-gray-600">Productivity Score</div>
        </motion.div>
      </div>

      {metrics.trendsData && (
        <motion.div 
          className="h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatChartData()}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4F46E5" 
                strokeWidth={2}
                dot={{ fill: '#4F46E5', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};