


import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CRMAnalyticsSection } from '../types';
import AnalyticsL3Sidebar from '../components/AnalyticsL3Sidebar';
import AIChartCard from '../../../components/AIChartCard';
import ActivityReports from './analytics/ActivityReports';
import LeadSources from './analytics/LeadSources';

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <GlassCard className="p-4 transition-all hover:border-cyber-cyan/50">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </GlassCard>
);

const SalesReportsContent: React.FC = () => (
    <div className="h-full flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <KpiCard title="Total Revenue" value="$1.45M" />
            <KpiCard title="Deals Won" value="89" />
            <KpiCard title="Avg. Deal Size" value="$16,292" />
            <KpiCard title="Avg. Sales Cycle" value="34 days" />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0">
             <AIChartCard
                title="Sales Performance (Last 12 Months)"
                prompt="Create a bar chart showing monthly sales revenue for the last 12 months, with sample data starting around $80k and trending upwards to about $150k."
            />
            <div className="flex flex-col gap-2">
                 <AIChartCard
                    title="Deal Win/Loss Ratio"
                    prompt="Create a pie chart showing a deal ratio of 72% Won and 28% Lost."
                />
                 <AIChartCard
                    title="Lead Source Effectiveness"
                    prompt="Create a bar chart comparing lead sources: Organic Search (50 leads), Paid Ads (35 leads), Referrals (25 leads), Social Media (15 leads)."
                />
            </div>
        </div>
    </div>
);

const PlaceholderContent: React.FC<{ section: string }> = ({ section }) => (
    <GlassCard className="h-full flex items-center justify-center">
        <p className="text-gray-400 font-mono text-lg">{section} Content</p>
    </GlassCard>
);

const Analytics: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<CRMAnalyticsSection>('Sales Reports');

    const renderContent = () => {
        switch (activeL3Section) {
            case 'Sales Reports':
                return <SalesReportsContent />;
            case 'Activity Reports':
                return <ActivityReports />;
            case 'Lead Sources':
                return <LeadSources />;
            default:
                return <PlaceholderContent section={activeL3Section} />;
        }
    };

    return (
        <div className="flex h-full">
            <AnalyticsL3Sidebar activeSection={activeL3Section} setActiveSection={setActiveL3Section} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3">
                {renderContent()}
            </main>
        </div>
    );
};

export default Analytics;
