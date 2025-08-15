
import React, { useState, useEffect } from 'react';
import { KnowledgeBaseStoreSection, KnowledgeBaseStoreL4Section } from '../types';
import { KNOWLEDGE_BASE_STORE_L3_SECTIONS, KNOWLEDGE_BASE_STORE_L4_MAP } from '../../../constants';
import GlassCard from '../../../components/GlassCard';
import Placeholder from '../../../components/Placeholder';
import StoreL4Sidebar from '../components/StoreL4Sidebar';

const Store: React.FC = () => {
    const [activeL3, setActiveL3] = useState<KnowledgeBaseStoreSection>('Books');
    const [activeL4, setActiveL4] = useState<KnowledgeBaseStoreL4Section | null>(null);

    useEffect(() => {
        const l4sections = KNOWLEDGE_BASE_STORE_L4_MAP[activeL3];
        setActiveL4(l4sections ? l4sections[0] : null);
    }, [activeL3]);

    const renderContent = () => {
        if (activeL4) {
            return <Placeholder sectionName={`${activeL3} - ${activeL4}`} />;
        }
        return <Placeholder sectionName="Store" />;
    };

    return (
        <div className="h-full flex flex-col p-1 sm:p-2 lg:p-3 gap-2">
            <GlassCard className="p-2 flex-shrink-0">
                 <div className="flex items-center gap-1 overflow-x-auto">
                    {KNOWLEDGE_BASE_STORE_L3_SECTIONS.map(item => (
                        <button
                            key={item}
                            onClick={() => setActiveL3(item)}
                            className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                                activeL3 === item
                                ? 'bg-cyber-purple/20 text-cyber-purple'
                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </GlassCard>

            <div className="flex flex-1 overflow-hidden">
                <StoreL4Sidebar activeL3={activeL3} activeL4={activeL4} setActiveL4={setActiveL4} />
                <main className="flex-1 pl-2 min-w-0">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Store;
