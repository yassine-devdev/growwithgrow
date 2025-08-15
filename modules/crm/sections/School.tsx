

import React, { useState } from 'react';
import { CRMSchoolSection, School as SchoolType } from '../types';
import SchoolL3Sidebar from '../components/SchoolL3Sidebar';
import GlassCard from '../../../components/GlassCard';
import AllSchools from './school/AllSchools';
import AddSchoolModal from '../components/AddSchoolModal';
import DataImport from './school/DataImport';
import Preferences from './school/Preferences';
import Billing from './school/Billing';
import Analytics from './school/Analytics';
import Placeholder from '../../../components/Placeholder';

const School: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<CRMSchoolSection>('All Schools');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [schools, setSchools] = useState<SchoolType[]>([
        { id: 1, name: 'North Star Academy', admin: 'Dr. Evelyn Reed', status: 'Active', students: 1250, plan: 'Enterprise' },
        { id: 2, name: 'Beacon High', admin: 'Mr. Johnathan Pierce', status: 'Active', students: 820, plan: 'Pro' },
        { id: 3, name: 'Oakridge International', admin: 'Ms. Anya Sharma', status: 'Trial', students: 350, plan: 'Pro' },
        { id: 4, name: 'Westwood Elementary', admin: 'Mrs. Carol Denvers', status: 'Inactive', students: 480, plan: 'Basic' },
    ]);

    const handleSetActiveSection = (section: CRMSchoolSection) => {
        if (section === 'Add School') {
            setIsModalOpen(true);
        } else {
            setActiveL3Section(section);
        }
    };

    const handleAddSchool = (school: Omit<SchoolType, 'id'>) => {
        const newSchool: SchoolType = { ...school, id: Date.now() };
        setSchools(prev => [newSchool, ...prev]);
    };


    const renderContent = () => {
        switch (activeL3Section) {
            case 'All Schools':
                return <AllSchools schools={schools} setSchools={setSchools} onAddSchoolClick={() => setIsModalOpen(true)} />;
            case 'Data Import':
                return <DataImport />;
            case 'Preferences':
                return <Preferences />;
            case 'Billing & Subscriptions':
                return <Billing />;
            case 'Analytics':
                return <Analytics />;
            default:
                return <Placeholder sectionName={activeL3Section} />;
        }
    };

    return (
        <div className="flex h-full w-full">
            <SchoolL3Sidebar activeSection={activeL3Section} setActiveSection={handleSetActiveSection} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3">
                {renderContent()}
            </main>
            {isModalOpen && <AddSchoolModal onClose={() => setIsModalOpen(false)} onAddSchool={handleAddSchool} />}
        </div>
    );
};

export default School;
