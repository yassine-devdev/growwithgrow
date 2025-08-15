
import React from 'react';
import GlassCard from '../../../components/GlassCard';
import AIServiceTest from '../../../components/AIServiceTest';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const systemPerfData = [
  { name: '10m ago', cpu: 65, mem: 55 },
  { name: '8m ago', cpu: 62, mem: 58 },
  { name: '6m ago', cpu: 70, mem: 62 },
  { name: '4m ago', cpu: 55, mem: 60 },
  { name: '2m ago', cpu: 63, mem: 65 },
  { name: 'now', cpu: 40, mem: 70 },
];

const Overview: React.FC = () => {
  const latestHealthData = systemPerfData[systemPerfData.length - 1];

  return (
    <div className="space-y-4">
      {/* AI Service Test Panel */}
      <AIServiceTest />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
        {/* Main content column */}
        <div className="lg:col-span-2 flex flex-col gap-2">
        {/* Resource Utilization Chart */}
        <GlassCard className="p-6 flex flex-col min-h-[400px] flex-grow">
          <h3 className="text-xl font-semibold text-white mb-4">Resource Utilization (Last 10 Mins)</h3>
          <div className="flex-1 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={systemPerfData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#d1d5db' }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#d1d5db' }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 26, 0.8)', borderColor: 'rgba(0, 255, 255, 0.3)', backdropFilter: 'blur(10px)', }} labelStyle={{ color: '#ffffff' }} />
                <Legend wrapperStyle={{ color: '#ffffff' }}/>
                <Line type="monotone" dataKey="cpu" stroke="#00ffff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8, stroke: '#00ffff', fill: '#0a0a1a' }} />
                <Line type="monotone" dataKey="mem" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8, stroke: '#a855f7', fill: '#0a0a1a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Sidebar with stats */}
      <div className="flex flex-col gap-2">
        <GlassCard className="p-6 flex flex-col gap-2 transition-all hover:border-cyber-cyan hover:shadow-glow-cyan">
          <h3 className="text-lg font-semibold text-gray-300">Active Users</h3>
          <p className="text-4xl font-bold text-white">1,428</p>
          <p className="text-sm text-green-400">+12% from last hour</p>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col gap-2 transition-all hover:border-cyber-purple hover:shadow-glow-purple">
          <h3 className="text-lg font-semibold text-gray-300">AI Queries</h3>
          <p className="text-4xl font-bold text-white">38,920</p>
          <p className="text-sm text-green-400">+5.2k today</p>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col gap-2 transition-all hover:border-cyber-orange hover:shadow-glow-orange">
          <h3 className="text-lg font-semibold text-gray-300">System Errors</h3>
          <p className="text-4xl font-bold text-white">4</p>
          <p className="text-sm text-red-400">2 critical alerts</p>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col gap-2 transition-all hover:border-cyber-cyan hover:shadow-glow-cyan">
            <h3 className="text-lg font-semibold text-gray-300">System Health</h3>
            <div className="flex justify-around items-center h-full pt-2">
                <div className="text-center">
                    <p className="text-3xl font-bold text-cyber-cyan">{latestHealthData.cpu}%</p>
                    <p className="text-sm text-gray-400">CPU Load</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-cyber-purple">{latestHealthData.mem}%</p>
                    <p className="text-sm text-gray-400">Memory</p>
                </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Overview;
