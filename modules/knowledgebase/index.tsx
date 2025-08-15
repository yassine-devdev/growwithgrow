
import React from 'react';
import { KnowledgeBaseSection } from './types';
import KnowledgeBaseL2Sidebar from './components/KnowledgeBaseL2Sidebar';
import Curriculum from './sections/Curriculum';
import Assessments from './sections/Assessments';
import Library from './sections/Library';
import AISearch from './sections/AISearch';
import Store from './sections/Store';


interface KnowledgeBaseProps {
    activeSection: KnowledgeBaseSection;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ activeSection }) => {
    const renderSection = () => {
        switch (activeSection) {
            case 'Curriculum':
                return <Curriculum />;
            case 'Assessments':
                return <Assessments />;
            case 'Library':
                return <Library />;
            case 'AI Search':
                return <AISearch />;
            case 'Store':
                return <Store />;
            default:
                return <Curriculum />;
        }
    };

    return (
        <div className="flex -m-1 sm:-m-2 lg:-m-3 h-full animate-fade-in">
            <KnowledgeBaseL2Sidebar activeSection={activeSection} setActiveSection={() => {}} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                {renderSection()}
            </main>
        </div>
    );
};

export default KnowledgeBase;