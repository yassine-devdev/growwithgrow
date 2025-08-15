

import React from 'react';
import GlassCard from '../../../../components/GlassCard';
import AIChartCard from '../../../../components/AIChartCard';

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <GlassCard className="p-4 transition-all hover:border-cyber-cyan/50">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </GlassCard>
);

const Analytics: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">School Analytics</h2>
            <p className="text-gray-400 -mt-4">Insights into the schools on your platform.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <KpiCard title="Total Schools" value="128" />
                <KpiCard title="Active Subscriptions" value="112" />
                <KpiCard title="Total Students" value="85,430" />
                <KpiCard title="MRR" value="$185k" />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0">
                <AIChartCard
                    title="School Growth Over Time"
                    prompt="Create a line chart showing the cumulative number of schools onboarded per month for the last 6 months: Jan (80), Feb (85), Mar (92), Apr (105), May (115), Jun (128)."
                    className="h-full"
                />
                <div className="flex flex-col gap-2">
                     <AIChartCard
                        title="Subscription Plan Distribution"
                        prompt="Create a pie chart showing the distribution of school subscription plans: Enterprise (35%), Pro (50%), Basic (15%)."
                    />
                     <AIChartCard
                        title="Schools by Region"
                        prompt="Create a bar chart showing the number of schools by region: North America (55), Europe (32), Asia (25), South America (10), Africa (6)."
                    />
                </div>
            </div>
        </div>
    );
};

export default Analytics;
