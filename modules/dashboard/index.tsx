

import React from 'react';
import { DashboardSection } from './types';
import DashboardL2Sidebar from './components/DashboardL2Sidebar';
import Overview from './sections/Overview';
import Analytics from './sections/Analytics';
import Reports from './sections/Reports';


interface DashboardProps {
    activeSection: DashboardSection;
}

const Dashboard: React.FC<DashboardProps> = ({ activeSection }) => {
    const renderSection = () => {
        switch (activeSection) {
            case 'Overview':
                return <Overview />;
            case 'Analytics':
                return <Analytics />;
            case 'Reports':
                return <Reports />;
            default:
                return <Overview />;
        }
    };

    return (
        <div className="flex -m-1 sm:-m-2 lg:-m-3 h-full animate-fade-in">
            <DashboardL2Sidebar />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                {renderSection()}
            </main>
        </div>
    );
};

export default Dashboard;
