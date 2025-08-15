
import React from 'react';
import GlassCard from '../../../../components/GlassCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const data = [
  { name: 'Salaries', value: 45000, color: '#3b82f6' },
  { name: 'Marketing', value: 12000, color: '#8b5cf6' },
  { name: 'Utilities', value: 7500, color: '#10b981' },
  { name: 'Supplies', value: 5000, color: '#f59e0b' },
  { name: 'Other', value: 3000, color: '#ef4444' },
];

const LegendItem: React.FC<{color: string, name: string, value: number}> = ({ color, name, value }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
            <span className="text-gray-300">{name}</span>
        </div>
        <span className="font-semibold text-white">${value.toLocaleString()}</span>
    </div>
);

const ExpenseBreakdownCard: React.FC = () => {
    return (
        <GlassCard className="h-full flex flex-col p-4">
            <h3 className="text-lg font-bold mb-4 text-white">Expense Breakdown</h3>
            <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={'50%'} outerRadius={'80%'} fill="#8884d8" paddingAngle={5} dataKey="value">
                            {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'rgba(10, 10, 26, 0.8)',
                                borderColor: 'rgba(0, 255, 255, 0.3)',
                                backdropFilter: 'blur(10px)',
                                color: '#ffffff'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
                {data.map(item => <LegendItem key={item.name} {...item} />)}
            </div>
        </GlassCard>
    )
};

export default ExpenseBreakdownCard;
