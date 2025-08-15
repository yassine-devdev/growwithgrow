
import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { generateChartData } from '../services/geminiService';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';

const COLORS = ['#00ffff', '#a855f7', '#f97316', '#22c55e', '#ec4899', '#facc15'];

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <svg className="animate-spin h-8 w-8 text-cyber-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const RenderGeneratedChart: React.FC<{ result: any }> = ({ result }) => {
    if (!result || !result.data || result.data.length === 0) {
        return <div className="text-center text-gray-500">No data to display.</div>;
    }
    
    const { chartType, data, description } = result;

    const chartTooltip = <Tooltip
        contentStyle={{
            backgroundColor: 'rgba(10, 10, 26, 0.8)',
            borderColor: 'rgba(0, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff'
        }}
        labelStyle={{ color: '#ffffff' }}
    />;

    return (
        <div className="w-full h-full flex flex-col">
            <h4 className="text-base font-semibold text-white mb-2 text-center truncate" title={description}>{description}</h4>
            <div className="flex-1 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                        switch (chartType?.toLowerCase()) {
                            case 'bar':
                                return (
                                    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
                                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 10 }} interval={0} />
                                        <YAxis stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                                        {chartTooltip}
                                        <Bar dataKey="value" name="Value">
                                          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                );
                            case 'line':
                                return (
                                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
                                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                                        <YAxis stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                                        {chartTooltip}
                                        <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={{r: 4}} activeDot={{r: 8}} name="Value" />
                                    </LineChart>
                                );
                            case 'pie':
                                return (
                                    <PieChart>
                                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={'80%'} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        {chartTooltip}
                                    </PieChart>
                                );
                            default:
                                return <div className="text-center text-red-500 p-4">Unsupported chart type: {chartType}. Try 'bar', 'line', or 'pie'.</div>;
                        }
                    })()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};


interface AIChartCardProps {
    title: string;
    prompt: string;
    className?: string;
}

const AIChartCard: React.FC<AIChartCardProps> = ({ title, prompt, className }) => {
    const [chartResult, setChartResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await generateChartData(prompt);
                setChartResult(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [prompt]);

    return (
        <GlassCard className={`p-6 flex flex-col ${className}`}>
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <div className="flex-1 min-h-[300px]">
                {isLoading && <LoadingSpinner />}
                {error && <div className="text-center text-red-400 p-4">{error}</div>}
                {chartResult && !isLoading && <RenderGeneratedChart result={chartResult} />}
            </div>
        </GlassCard>
    );
}

export default AIChartCard;
