
import React, { useState } from 'react';
import MarketingL2Sidebar from './components/MarketingL2Sidebar';
import Placeholder from '../../../components/Placeholder';

const MarketingView: React.FC = () => {
    const [activeL2Item, setActiveL2Item] = useState('enrollment-funnel');
    
    const navItems = [
        { id: 'enrollment-funnel', label: 'Enrollment Funnel' },
        { id: 'persona-campaigns', label: 'Persona-Based Campaigns' },
        { id: 'social-proof', label: 'Social Proof Stream' },
        { id: 'marketing-roi', label: 'Marketing ROI Tracker' },
        { id: 'geo-campaigns', label: 'Geo-Targeted Campaigns' },
        { id: 'omnichannel', label: 'Omnichannel Communication' },
        { id: 'lead-nurturing', label: 'Targeted Lead Nurturing' },
        { id: 'reputation-monitoring', label: 'Reputation Monitoring' },
        { id: 'campaign-predictor', label: 'Campaign Success Predictor' },
        { id: 'virtual-events', label: 'Virtual Admissions Events' },
        { id: 'event-follow-up', label: 'Automated Follow-Up' },
        { id: 'ai-testimonial', label: 'AI Testimonial Curation' },
        { id: 'competitive-intel', label: 'Competitive Intelligence' },
        { id: 'ar-marketing', label: 'AR Marketing Integration' },
        { id: 'ai-event-planner', label: 'AI-Based Event Planner' }
    ];

    return (
        <div className="flex h-full">
            <MarketingL2Sidebar activeItem={activeL2Item} setActiveItem={setActiveL2Item} navItems={navItems} />
             <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto" style={{ height: '100%' }}>
                 <Placeholder sectionName={navItems.find(item => item.id === activeL2Item)?.label || 'Marketing & Admissions'} />
            </main>
        </div>
    );
};

export default MarketingView;
