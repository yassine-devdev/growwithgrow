


import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CRMDashboardSection } from '../types';
import DashboardL3Sidebar from '../components/DashboardL3Sidebar';
import MyTasks from './dashboard/MyTasks';
import Overview from './dashboard/Overview';
import TeamPerformance from './dashboard/TeamPerformance';

const PlaceholderContent: React.FC<{ section: string }> = ({ section }) => (
    <GlassCard className="h-full flex items-center justify-center">
        <p className="text-gray-400 font-mono text-lg">{section} Content</p>
    </GlassCard>
);

const Dashboard: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<CRMDashboardSection>('Overview');

    const renderContent = () => {
        switch (activeL3Section) {
            case 'Overview':
                return <Overview />;
            case 'Team Performance':
                return <TeamPerformance />;
            case 'My Tasks':
                return <MyTasks />;
            default:
                return <PlaceholderContent section={activeL3Section} />;
        }
    };

    return (
        <div className="flex h-full">
            <DashboardL3Sidebar activeSection={activeL3Section} setActiveSection={setActiveL3Section} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3">
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;
