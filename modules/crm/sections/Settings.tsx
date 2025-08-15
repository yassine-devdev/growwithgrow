

import React, { useState } from 'react';
import { CRMSettingsSection } from '../types';
import SettingsL3Sidebar from '../components/SettingsL3Sidebar';
import PipelineManagement from './settings/PipelineManagement';
import TeamManagement from './settings/TeamManagement';
import Properties from './settings/Properties';
import GlassCard from '../../../components/GlassCard';

const PlaceholderContent: React.FC<{ section: string }> = ({ section }) => (
    <GlassCard className="h-full flex items-center justify-center">
        <p className="text-gray-400 font-mono text-lg">{section} Content</p>
    </GlassCard>
);

const Settings: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<CRMSettingsSection>('Pipeline');

    const renderContent = () => {
        switch (activeL3Section) {
            case 'Pipeline':
                return <PipelineManagement />;
            case 'Properties':
                return <Properties />;
            case 'Team':
                return <TeamManagement />;
            default:
                return <PlaceholderContent section={activeL3Section} />;
        }
    };

    return (
        <div className="flex h-full">
            <SettingsL3Sidebar activeSection={activeL3Section} setActiveSection={setActiveL3Section} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3">
                {renderContent()}
            </main>
        </div>
    );
};

export default Settings;
