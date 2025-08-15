
import React, { useState } from 'react';
import ParentL2Sidebar from './components/ParentL2Sidebar';
import Placeholder from '../../../components/Placeholder';

const ParentView: React.FC = () => {
    const [activeL2Item, setActiveL2Item] = useState('concierge');

    const navItems = [
        { id: 'concierge', label: 'Personalized Concierge' },
        { id: 'recommendations', label: 'AI Recommendations' },
        { id: 'digest', label: 'Snapshot Digest' },
        { id: 'pulse-tracker', label: 'Learning Pulse Tracker' },
        { id: 'comms-hub', label: 'Communication Hub' },
        { id: 'translate', label: 'Auto-Translate' },
        { id: 'feedback', label: 'Open Feedback Loop' },
        { id: 'conferences', label: 'Parent-Teacher Conferences' },
        { id: 'siblings', label: 'Sibling Comparison' },
        { id: 'parent-hub', label: 'Parental Learning Hub' },
        { id: 'parent-coach', label: 'Parent AI Coach' },
        { id: 'homework-support', label: 'Homework Support' },
        { id: 'wellness-alerts', label: 'AI Wellness Alerts' },
        { id: 'emotional-insights', label: 'Emotional Health Insights' },
        { id: 'safety-tracking', label: 'Child Safety Tracking' },
        { id: 'parent-community', label: 'Parenting Community' },
        { id: 'volunteer', label: 'Volunteer Opportunities' },
        { id: 'cafeteria', label: 'Cafeteria Management' },
        { id: 'policy', label: 'School Policy Access' },
        { id: 'financial-aid', label: 'Integrated Financial Aid' }
    ];

    return (
        <div className="flex h-full">
            <ParentL2Sidebar activeItem={activeL2Item} setActiveItem={setActiveL2Item} navItems={navItems} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto" style={{ height: '100%' }}>
                 <Placeholder sectionName={navItems.find(item => item.id === activeL2Item)?.label || 'Parent Dashboard'} />
            </main>
        </div>
    );
};

export default ParentView;
