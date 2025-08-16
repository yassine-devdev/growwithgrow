
import React, { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Enhanced system performance data with more realistic metrics
const systemPerfData = [
  { name: '10m ago', cpu: 65, mem: 55, network: 42, storage: 78 },
  { name: '8m ago', cpu: 62, mem: 58, network: 45, storage: 79 },
  { name: '6m ago', cpu: 70, mem: 62, network: 38, storage: 81 },
  { name: '4m ago', cpu: 55, mem: 60, network: 52, storage: 77 },
  { name: '2m ago', cpu: 63, mem: 65, network: 48, storage: 80 },
  { name: 'now', cpu: 40, mem: 70, network: 55, storage: 82 },
];

// Real-time activity data
const activityData = [
  { time: '14:32', user: 'admin', action: 'System Update', status: 'success' },
  { time: '14:28', user: 'user_847', action: 'AI Query', status: 'processing' },
  { time: '14:25', user: 'system', action: 'Backup Complete', status: 'success' },
  { time: '14:22', user: 'user_291', action: 'Data Export', status: 'error' },
  { time: '14:18', user: 'admin', action: 'Security Scan', status: 'success' },
];

// Network traffic data
const networkData = [
  { time: '14:30', incoming: 2.4, outgoing: 1.8, connections: 1247 },
  { time: '14:25', incoming: 2.1, outgoing: 1.6, connections: 1189 },
  { time: '14:20', incoming: 2.8, outgoing: 2.2, connections: 1356 },
  { time: '14:15', incoming: 2.0, outgoing: 1.5, connections: 1123 },
  { time: '14:10', incoming: 2.6, outgoing: 2.0, connections: 1289 },
];

// AI Performance metrics
const aiMetrics = [
  { name: 'Response Time', value: 123, unit: 'ms', trend: '+5%' },
  { name: 'Accuracy', value: 98.7, unit: '%', trend: '+0.3%' },
  { name: 'Throughput', value: 2847, unit: 'req/s', trend: '+12%' },
  { name: 'Uptime', value: 99.94, unit: '%', trend: '+0.01%' },
];

// Enhanced KPI Card Component
const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  color: 'cyan' | 'purple' | 'orange' | 'green' | 'red';
}> = ({ title, value, subtitle, trend, trendType = 'neutral', icon, color }) => {
  const colorClasses = {
    cyan: 'border-cyber-cyan/30 bg-gradient-to-br from-cyber-cyan/10 to-cyber-cyan/5',
    purple: 'border-cyber-purple/30 bg-gradient-to-br from-cyber-purple/10 to-cyber-purple/5',
    orange: 'border-cyber-orange/30 bg-gradient-to-br from-cyber-orange/10 to-cyber-orange/5',
    green: 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5',
    red: 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5',
  };

  const textColors = {
    cyan: 'text-cyber-cyan',
    purple: 'text-cyber-purple',
    orange: 'text-cyber-orange',
    green: 'text-green-400',
    red: 'text-red-400',
  };

  const trendColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <GlassCard className={`p-6 border ${colorClasses[color]} transition-all duration-500 hover:scale-105 hover:shadow-glow-${color} group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${textColors[color]} font-mono`}>{value}</p>
            {trend && (
              <span className={`text-xs font-medium ${trendColors[trendType]} flex items-center gap-1`}>
                {trendType === 'positive' && '↗'}
                {trendType === 'negative' && '↘'}
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-400 mt-1 font-mono">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-br from-${color === 'cyan' ? 'cyber-cyan' : color === 'purple' ? 'cyber-purple' : color === 'orange' ? 'cyber-orange' : color === 'green' ? 'green-500' : 'red-500'}/20 border border-${color === 'cyan' ? 'cyber-cyan' : color === 'purple' ? 'cyber-purple' : color === 'orange' ? 'cyber-orange' : color === 'green' ? 'green-500' : 'red-500'}/30`}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Animated progress indicator */}
      <div className="w-full bg-gray-800/30 rounded-full h-1 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-${color === 'cyan' ? 'cyber-cyan' : color === 'purple' ? 'cyber-purple' : color === 'orange' ? 'cyber-orange' : color === 'green' ? 'green-500' : 'red-500'} to-${color === 'cyan' ? 'cyber-cyan' : color === 'purple' ? 'cyber-purple' : color === 'orange' ? 'cyber-orange' : color === 'green' ? 'green-500' : 'red-500'}/50 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, typeof value === 'number' ? value : 0))}%` }}
        />
      </div>
    </GlassCard>
  );
};

// Real-time Activity Feed Component
const ActivityFeed: React.FC = () => {
  return (
    <GlassCard className="p-6 border border-cyber-purple/30 bg-gradient-to-br from-cyber-purple/10 to-cyber-purple/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Real-time Activity</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400 font-mono">LIVE</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {activityData.map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/20 border border-gray-700/30 hover:bg-gray-800/30 transition-all duration-300">
            <div className={`w-2 h-2 rounded-full ${
              activity.status === 'success' ? 'bg-green-400' : 
              activity.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{activity.action}</p>
              <p className="text-xs text-gray-400 font-mono">{activity.user} • {activity.time}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activity.status === 'success' ? 'bg-green-500/20 text-green-400' : 
              activity.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
            } font-mono`}>
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

// AI Performance Metrics Component
const AIMetrics: React.FC = () => {
  return (
    <GlassCard className="p-6 border border-cyber-cyan/30 bg-gradient-to-br from-cyber-cyan/10 to-cyber-cyan/5">
      <h3 className="text-lg font-semibold text-white mb-4">AI Performance</h3>
      <div className="grid grid-cols-2 gap-4">
        {aiMetrics.map((metric, index) => (
          <div key={index} className="text-center p-3 rounded-lg bg-gray-800/20 border border-gray-700/30">
            <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">{metric.name}</p>
            <p className="text-xl font-bold text-cyber-cyan font-mono">{metric.value}{metric.unit}</p>
            <p className="text-xs text-green-400 font-mono">{metric.trend}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

const Overview: React.FC = () => {
  const latestHealthData = systemPerfData[systemPerfData.length - 1];
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-mono">System Dashboard</h1>
          <p className="text-gray-400 font-mono">Real-time monitoring & analytics</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-cyber-cyan font-mono">
            {currentTime.toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-400 font-mono">
            {currentTime.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Users"
          value="1,428"
          subtitle="Online now"
          trend="+12%"
          trendType="positive"
          color="cyan"
          icon={<svg className="w-5 h-5 text-cyber-cyan" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>}
        />
        <KPICard
          title="AI Queries"
          value="38,920"
          subtitle="Today"
          trend="+5.2k"
          trendType="positive"
          color="purple"
          icon={<svg className="w-5 h-5 text-cyber-purple" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KPICard
          title="System Errors"
          value="4"
          subtitle="2 critical"
          trend="-1"
          trendType="positive"
          color="red"
          icon={<svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>}
        />
        <KPICard
          title="Uptime"
          value="99.94%"
          subtitle="This month"
          trend="+0.01%"
          trendType="positive"
          color="green"
          icon={<svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Utilization Chart */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 border border-cyber-cyan/30 bg-gradient-to-br from-cyber-cyan/10 to-cyber-cyan/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white font-mono">Resource Utilization</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyber-cyan rounded-full"></div>
                  <span className="text-gray-300 font-mono">CPU</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyber-purple rounded-full"></div>
                  <span className="text-gray-300 font-mono">Memory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyber-orange rounded-full"></div>
                  <span className="text-gray-300 font-mono">Network</span>
                </div>
              </div>
            </div>
            
            <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={systemPerfData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00ffff" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="networkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af" 
                    tick={{ fill: '#d1d5db', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    tick={{ fill: '#d1d5db', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                    unit="%" 
                    axisLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 26, 0.95)', 
                      borderColor: 'rgba(0, 255, 255, 0.3)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono'
                    }} 
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#00ffff" 
                    strokeWidth={2}
                    fill="url(#cpuGradient)"
                    dot={{ r: 4, fill: '#00ffff', stroke: '#0a0a1a', strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: '#00ffff', fill: '#0a0a1a', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mem" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fill="url(#memGradient)"
                    dot={{ r: 4, fill: '#a855f7', stroke: '#0a0a1a', strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: '#a855f7', fill: '#0a0a1a', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="network" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    fill="url(#networkGradient)"
                    dot={{ r: 4, fill: '#f97316', stroke: '#0a0a1a', strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: '#f97316', fill: '#0a0a1a', strokeWidth: 2 }}
                  />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* System Health */}
          <GlassCard className="p-6 border border-cyber-purple/30 bg-gradient-to-br from-cyber-purple/10 to-cyber-purple/5">
            <h3 className="text-lg font-semibold text-white mb-4 font-mono">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-mono">CPU Load</span>
                <span className="text-lg font-bold text-cyber-cyan font-mono">{latestHealthData.cpu}%</span>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-cyan/50 rounded-full transition-all duration-1000"
                  style={{ width: `${latestHealthData.cpu}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-mono">Memory</span>
                <span className="text-lg font-bold text-cyber-purple font-mono">{latestHealthData.mem}%</span>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-cyber-purple to-cyber-purple/50 rounded-full transition-all duration-1000"
                  style={{ width: `${latestHealthData.mem}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-mono">Network</span>
                <span className="text-lg font-bold text-cyber-orange font-mono">{latestHealthData.network}%</span>
                </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-cyber-orange to-cyber-orange/50 rounded-full transition-all duration-1000"
                  style={{ width: `${latestHealthData.network}%` }}
                />
                </div>
            </div>
          </GlassCard>

          {/* AI Metrics */}
          <AIMetrics />

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default Overview;
