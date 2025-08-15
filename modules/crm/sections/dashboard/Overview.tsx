

import React from 'react';
import GlassCard from '../../../../components/GlassCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import * as Icons from '../../components/Icons';

const kpiData = [
    { title: 'New Leads', value: '75', change: '+15%', changeType: 'increase' },
    { title: 'Deals Won', value: '12', change: '+2', changeType: 'increase' },
    { title: 'Conversion Rate', value: '16%', change: '-1.2%', changeType: 'decrease' },
    { title: 'Pipeline Value', value: '$1.2M', change: '+$250k', changeType: 'increase' },
];

const salesFunnelData = [
    { name: 'Leads', value: 120 },
    { name: 'Qualified', value: 80 },
    { name: 'Proposal', value: 45 },
    { name: 'Negotiation', value: 25 },
    { name: 'Won', value: 12 },
];

const recentActivity = [
    { id: 1, type: 'deal', text: 'Deal "CyberCorp Q4 Upgrade" moved to Proposal Sent.', time: '2m ago', icon: Icons.DealsIcon },
    { id: 2, type: 'contact', text: 'New contact "Rachael Tyrell" added.', time: '1h ago', icon: Icons.ContactsIcon },
    { id: 3, type: 'task', text: 'Task "Follow up with lead from CyberCorp" completed.', time: '3h ago', icon: Icons.TasksIcon },
    { id: 4, type: 'deal', text: 'Deal "Tyrell Corp Replicant License" was won.', time: 'Yesterday', icon: Icons.DealsIcon },
];

const KpiCard: React.FC<typeof kpiData[0]> = ({ title, value, change, changeType }) => (
    <GlassCard className="p-4 transition-all hover:border-cyber-cyan/50">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        <p className={`text-sm font-semibold mt-1 ${changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>{change}</p>
    </GlassCard>
);

const RecentActivity: React.FC = () => (
    <GlassCard className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-4">
            {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyber-surface flex-shrink-0 flex items-center justify-center">
                        <activity.icon className="w-5 h-5 text-cyber-cyan" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-300">{activity.text}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                </div>
            ))}
        </div>
    </GlassCard>
);

const Overview: React.FC = () => (
    <div className="flex flex-col gap-2 h-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {kpiData.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2 min-h-0">
            <GlassCard className="p-6 flex flex-col h-full lg:col-span-2">
                <h3 className="text-xl font-bold text-white mb-4">Sales Funnel</h3>
                <div className="flex-1 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesFunnelData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" horizontal={false}/>
                            <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 12 }} width={80}/>
                            <Tooltip cursor={{fill: 'rgba(168, 85, 247, 0.1)'}} contentStyle={{ backgroundColor: 'rgba(10, 10, 26, 0.8)', borderColor: 'rgba(168, 85, 247, 0.3)', backdropFilter: 'blur(10px)' }} />
                            <Bar dataKey="value" fill="#a855f7" barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
            <RecentActivity />
        </div>
    </div>
);

export default Overview;
