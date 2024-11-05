import React from 'react';
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from "jspdf";

interface MonthlyReportsProps {
  insights?: string;
}

const MonthlyReports: React.FC<MonthlyReportsProps> = ({ insights }) => {
  // This is dummy data. In a real scenario, you'd parse this from the AI insights or fetch it separately
  const data = [
    { name: 'Week 1', tasks: 20, completion: 15 },
    { name: 'Week 2', tasks: 25, completion: 22 },
    { name: 'Week 3', tasks: 30, completion: 28 },
    { name: 'Week 4', tasks: 22, completion: 20 },
  ];

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Monthly Report', 105, 15, { align: 'center' });
    
    // Add insights
    doc.setFontSize(12);
    doc.text(insights || 'No insights available', 10, 30);
    
    // Save the PDF
    doc.save('monthly-report.pdf');
  };

  return (
    <div className="monthly-reports">
      <h2 className="text-2xl font-bold mb-4">Monthly Reports</h2>
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="tasks" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line yAxisId="right" type="monotone" dataKey="completion" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {insights ? (
        <>
          <div className="prose max-w-none mb-4">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
          <button 
            onClick={exportToPDF}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
          >
            Export to PDF
          </button>
        </>
      ) : (
        <p>No monthly report available. Try refreshing the insights.</p>
      )}
    </div>
  );
};

export default MonthlyReports;