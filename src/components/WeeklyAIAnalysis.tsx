import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { generateWeeklyAnalysis } from '../utils/advancedAIAnalysis';

const WeeklyAIAnalysis: React.FC = () => {
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [analysis, setAnalysis] = useState<{ summary: string; insights: string; recommendations: string } | null>(null);

  useEffect(() => {
    const userContext = {
      name: "John Doe", // This should come from user settings
      preferences: {
        workStyle: "Focused sprints with regular breaks",
        motivationFactors: ["Achieving goals", "Learning new skills", "Recognition"],
      },
      historicalData: {
        averageTasksPerWeek: 20,
        commonProjects: ["Work", "Personal Development", "Home"],
        productivityPeaks: ["Monday mornings", "Thursday afternoons"],
      },
    };

    generateWeeklyAnalysis(tasks, userContext).then(setAnalysis);
  }, [tasks]);

  if (!analysis) {
    return <div>Loading analysis...</div>;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-4">
      <h2 className="text-2xl font-bold mb-4">Your Weekly AI Analysis</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Summary</h3>
        <p className="text-gray-700">{analysis.summary}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Insights</h3>
        <p className="text-gray-700">{analysis.insights}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
        <p className="text-gray-700">{analysis.recommendations}</p>
      </div>
    </div>
  );
};

export default WeeklyAIAnalysis;