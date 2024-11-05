import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeeklyInsightsProps {
  insights?: string;
}

const WeeklyInsights: React.FC<WeeklyInsightsProps> = ({ insights }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // This is dummy data. In a real scenario, you'd parse this from the AI insights or fetch it separately
  const data = [
    { name: 'Monday', tasks: 4, Project1: 2, Project2: 1, Project3: 1 },
    { name: 'Tuesday', tasks: 3, Project1: 1, Project2: 1, Project3: 1 },
    { name: 'Wednesday', tasks: 2, Project1: 0, Project2: 2, Project3: 0 },
    { name: 'Thursday', tasks: 5, Project1: 2, Project2: 1, Project3: 2 },
    { name: 'Friday', tasks: 1, Project1: 0, Project2: 0, Project3: 1 },
  ];

  const projects = ['Project1', 'Project2', 'Project3'];

  return (
    <div className="weekly-insights">
      <h2 className="text-2xl font-bold mb-4">Weekly Insights</h2>
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend onClick={(e) => setSelectedProject(e.value)} />
            {selectedProject ? (
              <Bar dataKey={selectedProject} fill="#8884d8" />
            ) : (
              projects.map((project, index) => (
                <Bar key={project} dataKey={project} fill={`hsl(${index * 120}, 70%, 50%)`} />
              ))
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {insights ? (
        <div className="prose max-w-none">
          <ReactMarkdown>{insights}</ReactMarkdown>
        </div>
      ) : (
        <p>No weekly insights available. Try refreshing the insights.</p>
      )}
    </div>
  );
};

export default WeeklyInsights;