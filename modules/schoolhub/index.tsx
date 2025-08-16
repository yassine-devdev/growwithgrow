

import React from 'react';
import { SchoolHubSection } from './types';
import SchoolHubL2Sidebar from './components/SchoolHubL2Sidebar';
import SchoolDirectory from './school';
import StudentView from './student';
import ParentView from './parent';
import TeacherView from './teacher';
import AdministrationView from './administration';
import FinanceView from './finance';
import MarketingView from './marketing';

interface SchoolHubProps {
    activeSection: SchoolHubSection;
}

const SchoolHub: React.FC<SchoolHubProps> = ({ activeSection }) => {
    const renderSection = () => {
        switch (activeSection) {
            case 'School':
                return <SchoolDirectory />;
            case 'Student':
                return <StudentView />;
            case 'Parent':
                return <ParentView />;
            case 'Teacher':
                return <TeacherView />;
            case 'Administration':
                return <AdministrationView />;
            case 'Finance':
                return <FinanceView />;
            case 'Marketing':
                return <MarketingView />;
            default:
                return <SchoolDirectory />;
        }
    };

    // Remove the L2 sidebar completely - header navigation is sufficient
    return (
        <div className="animate-fade-in -m-1 sm:-m-2 lg:-m-3 h-full">
            {renderSection()}
        </div>
    );
};

export default SchoolHub;