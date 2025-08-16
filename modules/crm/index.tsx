


import React from 'react';
import { CRMSection } from './types';
import CRML2Sidebar from './components/CRML2Sidebar';
import Dashboard from './sections/Dashboard';
import Contacts from './sections/Contacts';
import Deals from './sections/Deals';
import Analytics from './sections/Analytics';
import Settings from './sections/Settings';
import School from './sections/School';

interface CRMProps {
    activeSection: CRMSection;
}

const CRM: React.FC<CRMProps> = ({ activeSection }) => {
    const renderSection = () => {
        switch (activeSection) {
            case 'Dashboard': return <Dashboard />;
            case 'Contacts': return <Contacts />;
            case 'Deals': return <Deals />;
            case 'Analytics': return <Analytics />;
            case 'Settings': return <Settings />;
            case 'School': return <School />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="animate-fade-in -m-1 sm:-m-2 lg:-m-3 h-full">
            {renderSection()}
        </div>
    );
};

export default CRM;