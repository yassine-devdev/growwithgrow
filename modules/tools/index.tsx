import React from 'react';
import { ToolsSection } from './types';
import ToolsL2Sidebar from './components/ToolsL2Sidebar';
import Overview from './sections/Overview';
import Marketing from './sections/Marketing';
import Finance from './sections/Finance';
import AITools from './sections/AITools';
import Setting from './sections/Setting';

interface ToolsProps {
    activeSection: ToolsSection;
}

const Tools: React.FC<ToolsProps> = ({ activeSection }) => {
    const renderSection = () => {
        switch (activeSection) {
            case 'Overview':
                return <Overview />;
            case 'Marketing':
                return <Marketing />;
            case 'Finance':
                return <Finance />;
            case 'AI':
                return <AITools />;
            case 'Setting':
                 return <Setting />;
            default:
                return <Overview />;
        }
    };

    return (
        <div className="flex -m-1 sm:-m-2 lg:-m-3 h-full animate-fade-in">
            <ToolsL2Sidebar activeSection={activeSection} setActiveSection={() => {}} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                {renderSection()}
            </main>
        </div>
    );
};

export default Tools;