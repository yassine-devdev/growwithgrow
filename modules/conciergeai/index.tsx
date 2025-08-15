import React from 'react';
import { ConciergeAISection } from './types';
import ConciergeAIL2Sidebar from './components/ConciergeAIL2Sidebar';
import Schools from './sections/Schools';
import SystemPrompts from './sections/SystemPrompts';
import UsageAnalytics from './sections/UsageAnalytics';
import GlobalSettings from './sections/GlobalSettings';
import Chat from './sections/Chat';


interface ConciergeAIProps {
    activeSection: ConciergeAISection;
}

const ConciergeAI: React.FC<ConciergeAIProps> = ({ activeSection }) => {
    const renderSection = () => {
        switch (activeSection) {
            case 'Schools':
                return <Schools />;
            case 'System Prompts':
                return <SystemPrompts />;
            case 'Usage Analytics':
                return <UsageAnalytics />;
            case 'Global Settings':
                return <GlobalSettings />;
            case 'Chat':
                return <Chat />;
            default:
                return <Schools />;
        }
    };

    return (
        <div className="flex -m-1 sm:-m-2 lg:-m-3 h-full animate-fade-in">
            <ConciergeAIL2Sidebar activeSection={activeSection} setActiveSection={() => {}} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                {renderSection()}
            </main>
        </div>
    );
};

export default ConciergeAI;