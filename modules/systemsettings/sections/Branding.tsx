import React, { useState } from 'react';
import SystemSettingsL3Sidebar from '../components/SystemSettingsL3Sidebar';
import { SystemSettingsBrandingSection } from '../types';
import GlassCard from '../../../components/GlassCard';

const PlaceholderContent: React.FC<{ section: string }> = ({ section }) => (
    <GlassCard className="h-full flex items-center justify-center">
        <p className="text-gray-400 font-mono text-lg">{section} Content</p>
    </GlassCard>
);

const Branding: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<SystemSettingsBrandingSection>('Logo & Colors');

    const renderContent = () => {
        return <PlaceholderContent section={activeL3Section} />;
    };

    return (
        <div className="flex h-full">
            <SystemSettingsL3Sidebar 
                activeL2Section="Branding" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};
export default Branding;
