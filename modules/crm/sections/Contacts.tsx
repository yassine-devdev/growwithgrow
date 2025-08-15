

import React, { useState } from 'react';
import { CRMContactsSection } from '../types';
import ContactsL3Sidebar from '../components/ContactsL3Sidebar';
import AllContacts from './contacts/AllContacts';
import AllCompanies from './contacts/AllCompanies';
import Lists from './contacts/Lists';
import ImportExport from './contacts/ImportExport';
import GlassCard from '../../../components/GlassCard';

const PlaceholderContent: React.FC<{ section: string }> = ({ section }) => (
    <GlassCard className="h-full flex items-center justify-center">
        <p className="text-gray-400 font-mono text-lg">{section} Content</p>
    </GlassCard>
);

const Contacts: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<CRMContactsSection>('All Contacts');

    const renderContent = () => {
        switch (activeL3Section) {
            case 'All Contacts':
                return <AllContacts />;
            case 'Companies':
                return <AllCompanies />;
            case 'Lists':
                return <Lists />;
            case 'Import/Export':
                return <ImportExport />;
            default:
                return <PlaceholderContent section={activeL3Section} />;
        }
    }

    return (
        <div className="flex h-full w-full">
            <ContactsL3Sidebar activeSection={activeL3Section} setActiveSection={setActiveL3Section} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3">
                {renderContent()}
            </main>
        </div>
    );
};

export default Contacts;
