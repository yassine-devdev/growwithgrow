
import React, { useState } from 'react';
import TeacherL2Sidebar from './components/TeacherL2Sidebar';
import Placeholder from '../../../components/Placeholder';

const TeacherView: React.FC = () => {
    const [activeL2Item, setActiveL2Item] = useState('staff-store');
    
    const navItems = [
        { id: 'staff-store', label: 'Staff Store' },
        { id: 'conference-booking', label: 'Conference Accommodation' },
        { id: 'car-rentals', label: 'Professional Car Rentals' },
        { id: 'maintenance', label: 'Classroom Maintenance' },
        { id: 'concierge', label: 'Professional Concierge' },
        { id: 'media-content', label: 'Educational Media' },
        { id: 'islamic-resources', label: 'Islamic Resources' },
        { id: 'ai-insights', label: 'AI Classroom Insights' },
        { id: 'gap-detector', label: 'Smart Gap Detector' },
        { id: 'remediation', label: 'Auto-Remediation Plans' },
        { id: 'custom-content', label: 'Customized Learning Content' },
        { id: 'ai-grading', label: 'AI-Assisted Grading' },
        { id: 'target-tracker', label: 'Learning Target Tracker' },
        { id: 'behavior-dash', label: 'Behavior Dashboard' },
        { id: 'iep-504', label: 'IEP/504 Plan Integration' },
        { id: 'assessment-builder', label: 'Assessment Builder' },
        { id: 'resource-hub', label: 'Resource Hub' },
        { id: 'collaboration', label: 'Real-Time Collaboration' },
        { id: 'exam-generator', label: 'AI Exam Generator' },
        { id: 'feedback-analysis', label: 'Automated Feedback Analysis' },
        { id: 'class-tools', label: 'Interactive Classroom Tools' },
        { id: 'peer-feedback', label: 'Peer Feedback' },
        { id: 'teacher-wellness', label: 'Teacher Wellness' },
        { id: 'substitute-portal', label: 'Substitute Teacher Portal' },
        { id: 'global-collab', label: 'Global Teacher Collaboration' }
    ];

    return (
        <div className="flex h-full">
            <TeacherL2Sidebar activeItem={activeL2Item} setActiveItem={setActiveL2Item} navItems={navItems} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto" style={{ height: '100%' }}>
                 <Placeholder sectionName={navItems.find(item => item.id === activeL2Item)?.label || 'Teacher Dashboard'} />
            </main>
        </div>
    );
};

export default TeacherView;
