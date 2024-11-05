import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DailyInsightsProps {
  insights?: string;
}

const DailyInsights: React.FC<DailyInsightsProps> = ({ insights }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // This is dummy data. In a real scenario, you'd parse this from the AI insights or fetch it separately
  const data = [
    { name: 'Completed', value: 5 },
    { name: 'In Progress', value: 3 },
    { name: 'Not Started', value: 2 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="daily-insights">
      <h2 className="text-2xl font-bold mb-4">Daily Insights</h2>
      {insights ? (
        <>
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="prose max-w-none">
            <ReactMarkdown
              components={{
                h3: ({node, ...props}) => (
                  <h3 
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => toggleSection(props.children as string)}
                    {...props}
                  />
                )
              }}
            >
              {insights}
            </ReactMarkdown>
          </div>
          {expandedSection && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-bold mb-2">Detailed View: {expandedSection}</h4>
              <p>Additional details about {expandedSection} would go here...</p>
            </div>
          )}
        </>
      ) : (
        <p>No daily insights available. Try refreshing the insights.</p>
      )}
    </div>
  );
};

export default DailyInsights;