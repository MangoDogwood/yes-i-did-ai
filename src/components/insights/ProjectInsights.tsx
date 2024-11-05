import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface ProjectInsightsProps {
  insights?: string;
}

const ProjectInsights: React.FC<ProjectInsightsProps> = ({ insights }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const data = [
    {
      name: 'Project1',
      children: [
        { name: 'Task1', size: 3 },
        { name: 'Task2', size: 2 },
        { name: 'Task3', size: 1 },
      ],
    },
    {
      name: 'Project2',
      children: [
        { name: 'Task4', size: 2 },
        { name: 'Task5', size: 3 },
      ],
    },
    {
      name: 'Project3',
      children: [
        { name: 'Task6', size: 1 },
        { name: 'Task7', size: 1 },
        { name: 'Task8', size: 1 },
      ],
    },
  ];

  return (
    <div className="project-insights">
      <h2 className="text-2xl font-bold mb-4">Project Insights</h2>
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={data}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      {insights ? (
        <div className="prose max-w-none">
          <ReactMarkdown>{insights}</ReactMarkdown>
        </div>
      ) : (
        <p>No project insights available. Try refreshing the insights.</p>
      )}
      {selectedProject && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h4 className="font-bold mb-2">Project Details: {selectedProject}</h4>
          <p>Detailed information about {selectedProject} would go here...</p>
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded">
        <p className="label">{`${payload[0].payload.name} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default ProjectInsights;