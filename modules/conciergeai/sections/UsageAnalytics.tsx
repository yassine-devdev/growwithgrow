
import React, { useState } from 'react';
import ConciergeAIL3Sidebar from '../components/ConciergeAIL3Sidebar';
import { ConciergeAIUsageAnalyticsSection } from '../types';
import AIChartCard from '../../../components/AIChartCard';
import GlassCard from '../../../components/GlassCard';

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <GlassCard className="p-4 transition-all hover:border-cyber-cyan/50">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </GlassCard>
);

const OverallUsageContent: React.FC = () => (
     <div className="h-full flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <KpiCard title="Total Queries (24h)" value="15,280" />
            <KpiCard title="Avg. Response Time" value="1.2s" />
            <KpiCard title="Active Schools" value="112" />
            <KpiCard title="Estimated Cost (24h)" value="$45.84" />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0">
             <AIChartCard
                title="AI Queries by Hour (Last 24h)"
                prompt="Create a line chart showing hourly AI queries for a 24-hour period. Show low traffic during night hours and two peaks during the day, one in the morning and one in the afternoon. Total queries should be around 15,000."
            />
            <AIChartCard
                title="Top 5 Schools by Usage"
                prompt="Create a bar chart showing the top 5 schools by AI query volume: North Star Academy (3200), Beacon High (2800), Oakridge Int'l (1900), Westwood Elementary (1500), Pinecrest Academy (1200)."
            />
        </div>
    </div>
);


const UsageAnalytics: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<ConciergeAIUsageAnalyticsSection>('Overall Usage');

    const renderContent = () => {
       switch(activeL3Section) {
            case 'Overall Usage':
                return <OverallUsageContent />;
            default:
                 return <GlassCard className="h-full flex items-center justify-center"><p className="text-gray-400 font-mono text-lg">{activeL3Section} Content</p></GlassCard>;
       }
    };

    return (
        <div className="flex h-full">
            <ConciergeAIL3Sidebar 
                activeL2Section="Usage Analytics" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3">
                {renderContent()}
            </main>
        </div>
    );
};
export default UsageAnalytics;
