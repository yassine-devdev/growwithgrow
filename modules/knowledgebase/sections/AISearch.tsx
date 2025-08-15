import React, { useState } from 'react';
import KnowledgeBaseL3Sidebar from '../components/KnowledgeBaseL3Sidebar';
import { KnowledgeBaseAISearchSection } from '../types';
import GlassCard from '../../../components/GlassCard';

const PlaceholderContent: React.FC<{ section: string }> = ({ section }) => (
    <GlassCard className="h-full flex items-center justify-center">
        <p className="text-gray-400 font-mono text-lg">{section} Content</p>
    </GlassCard>
);

const AISearch: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<KnowledgeBaseAISearchSection>('Search Interface');

    const renderContent = () => {
        return <PlaceholderContent section={activeL3Section} />;
    };

    return (
        <div className="flex h-full">
            <KnowledgeBaseL3Sidebar 
                activeL2Section="AI Search" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};
export default AISearch;
