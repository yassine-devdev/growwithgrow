import React, { useState, useEffect } from 'react';
import { ToolsMarketingL3Section, ToolsMarketingL4Section } from '../types';
import { TOOLS_MARKETING_SECTIONS_L3, TOOLS_MARKETING_L4_MAP } from '../../../constants';
import GlassCard from '../../../components/GlassCard';
import Placeholder from '../../../components/Placeholder';
import MarketingL4Sidebar from '../components/MarketingL4Sidebar';
import AICampaignPlanner from './marketing/AICampaignPlanner';
import AITitleMetaGenerator from './marketing/AITitleMetaGenerator';
import SocialMediaManager from './marketing/SocialMediaManager';

const Marketing: React.FC = () => {
    const [activeL3, setActiveL3] = useState<ToolsMarketingL3Section>('Social Media Suite');
    const [activeL4, setActiveL4] = useState<ToolsMarketingL4Section | null>(null);

    useEffect(() => {
        const l4sections = TOOLS_MARKETING_L4_MAP[activeL3];
        // Pre-select for a better demo experience
        if (activeL3 === 'Automation & AI Assistance') {
             setActiveL4('Planner');
        } else if (activeL3 === 'Social Media Suite') {
            setActiveL4('AI Post');
        } else {
            setActiveL4(l4sections ? (l4sections[0] as ToolsMarketingL4Section) : null);
        }
    }, [activeL3]);

    const renderContent = () => {
        if (activeL3 === 'Automation & AI Assistance' && activeL4 === 'Planner') {
            return <AICampaignPlanner />;
        }
        if (activeL3 === 'SEO Command Center' && activeL4 === 'Generator') {
            return <AITitleMetaGenerator />;
        }
        if (activeL3 === 'Social Media Suite' && activeL4 === 'AI Post') {
            return <SocialMediaManager />;
        }
        
        if (activeL4) {
            return <Placeholder sectionName={activeL4} />;
        }
        return <Placeholder sectionName="Marketing" />;
    };

    return (
        <div className="h-full flex flex-col p-1 sm:p-2 lg:p-3 gap-2">
            <GlassCard className="p-2 flex-shrink-0">
                 <div className="flex items-center gap-1 overflow-x-auto">
                    {TOOLS_MARKETING_SECTIONS_L3.map(item => (
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
                <MarketingL4Sidebar activeL3={activeL3} activeL4={activeL4 as any} setActiveL4={setActiveL4 as any}/>
                <main className="flex-1 pl-2 min-w-0">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Marketing;
