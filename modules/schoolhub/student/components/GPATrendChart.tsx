
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const gpaData = [
  { semester: 'Fall \'23', gpa: 3.5 },
  { semester: 'Spring \'24', gpa: 3.7 },
  { semester: 'Fall \'24', gpa: 3.6 },
  { semester: 'Current', gpa: 3.8 },
];

const GPATrendChart: React.FC = () => {
  return (
    <div className="h-48 -ml-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={gpaData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
          <XAxis dataKey="semester" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 10 }} />
          <YAxis domain={[3.0, 4.0]} stroke="#9ca3af" tick={{ fill: '#d1d5db' }} />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 26, 0.8)', 
                borderColor: 'rgba(0, 255, 255, 0.3)', 
                backdropFilter: 'blur(10px)' 
            }} 
            labelStyle={{ color: '#ffffff' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="gpa" name="GPA" stroke="#00ffff" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GPATrendChart;
