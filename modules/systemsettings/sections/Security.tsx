
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { SystemSettingsSecurityL3Section } from '../types';
import SecurityL3Sidebar from '../components/SecurityL3Sidebar';
import Placeholder from '../../../components/Placeholder';

const Security: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<SystemSettingsSecurityL3Section>('Access Policies');
    
    const renderContent = () => {
        return <Placeholder sectionName={activeL3Section} />;
    };

    return (
        <div className="flex h-full">
            <SecurityL3Sidebar 
                activeSection={activeL3Section} 
                setActiveSection={setActiveL3Section} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                <div className="h-full flex flex-col gap-2">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Security;
