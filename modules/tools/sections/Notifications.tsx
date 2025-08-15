
import React, { useState } from 'react';
import ToolsL3Sidebar from '../components/ToolsL3Sidebar';
import { ToolsSettingSection } from '../types';
import GlassCard from '../../../components/GlassCard';

const PlaceholderContent: React.FC<{ section: string }> = ({ section }) => (
    <GlassCard className="h-full flex items-center justify-center">
        <p className="text-gray-400 font-mono text-lg">{section} Content</p>
    </GlassCard>
);

const Notifications: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<ToolsSettingSection>('API Keys');

    const renderContent = () => {
        return <PlaceholderContent section="Notifications" />;
    };

    return (
        <div className="flex h-full">
            <ToolsL3Sidebar 
                activeL2Section="Setting" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};
export default Notifications;
