
import React from 'react';
import * as Icons from './Icons';
import { KnowledgeBaseAssessmentsL3Section } from '../types';
import { KNOWLEDGE_BASE_ASSESSMENTS_L3_CORE_SECTIONS, KNOWLEDGE_BASE_ASSESSMENTS_L3_INNOVATION_SECTIONS } from '../../../constants';
import { BrainIcon, ShieldIcon } from '../../schoolhub/student/components/Icons';

interface NavItemProps {
    icon: React.FC<{ className?: string }>;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, onClick }) => {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1
            ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
        >
            <Icon className="h-6 w-6 text-white mb-1" />
            <span className="text-white text-[10px] font-medium leading-tight text-center">{label}</span>
        </button>
    );
};

interface AssessmentsL3SidebarProps {
    activeSection: KnowledgeBaseAssessmentsL3Section;
    setActiveSection: (section: KnowledgeBaseAssessmentsL3Section) => void;
}

const iconMap: Record<KnowledgeBaseAssessmentsL3Section, React.FC<{className?: string}>> = {
    'Create New': Icons.CreateAssessmentIcon,
    'Question Bank': Icons.QuestionBanksIcon,
    'View Results': Icons.ViewResultsIcon,
    'Generative Assessments (AI)': Icons.GenerativeAssessmentsIcon,
    'Adaptive Testing Engine': BrainIcon,
    'Integrity Shield (AI)': ShieldIcon,
};

const AssessmentsL3Sidebar: React.FC<AssessmentsL3SidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-[#ca8a04] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1 flex flex-col gap-1">
                    {KNOWLEDGE_BASE_ASSESSMENTS_L3_CORE_SECTIONS.map((item) => (
                        <NavItem key={item} label={item} icon={iconMap[item]} active={activeSection === item} onClick={() => setActiveSection(item)} />
                    ))}
                    
                    <div className="my-2">
                        <h3 className="text-[10px] font-bold text-gray-200/50 uppercase tracking-wider text-center">Innovation</h3>
                    </div>

                    {KNOWLEDGE_BASE_ASSESSMENTS_L3_INNOVATION_SECTIONS.map((item) => (
                        <NavItem key={item} label={item} icon={iconMap[item]} active={activeSection === item} onClick={() => setActiveSection(item)} />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default AssessmentsL3Sidebar;
