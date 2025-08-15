
import React, { useState } from 'react';
import AssessmentsL3Sidebar from '../components/AssessmentsL3Sidebar';
import { KnowledgeBaseAssessmentsL3Section } from '../types';
import Placeholder from '../../../components/Placeholder';

const Assessments: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<KnowledgeBaseAssessmentsL3Section>('Create New');

    const renderContent = () => {
        return <Placeholder sectionName={activeL3Section} />;
    };

    return (
        <div className="flex h-full">
            <AssessmentsL3Sidebar
                activeSection={activeL3Section}
                setActiveSection={setActiveL3Section}
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};
export default Assessments;
