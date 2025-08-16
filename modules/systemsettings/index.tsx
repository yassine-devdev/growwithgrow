
import React from 'react';
import { SystemSettingsSection } from './types';
import SystemSettingsL2Sidebar from './components/SystemSettingsL2Sidebar';
import General from './sections/General';
import Users from './sections/Users';
import Security from './sections/Security';
import Integrations from './sections/Integrations';
import Branding from './sections/Branding';
import Theme from './sections/Theme';

interface SystemSettingsProps {
    activeSection: SystemSettingsSection;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ activeSection }) => {
    const renderSection = () => {
        switch (activeSection) {
            case 'General':
                return <General />;
            case 'Users':
                return <Users />;
            case 'Security':
                return <Security />;
            case 'Integrations':
                return <Integrations />;
            case 'Branding':
                return <Branding />;
            case 'Theme':
                return <Theme />;
            default:
                return <General />;
        }
    };

    return (
        <div className="animate-fade-in -m-1 sm:-m-2 lg:-m-3 h-full">
            {renderSection()}
        </div>
    );
};

export default SystemSettings;