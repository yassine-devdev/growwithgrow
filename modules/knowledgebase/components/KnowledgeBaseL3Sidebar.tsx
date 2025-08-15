import React from 'react';
import { ModuleSection } from '../../../types';
import { KnowledgeBaseSection } from '../types';
import { KNOWLEDGE_BASE_L3_MAP } from '../../../constants';
import * as Icons from './Icons';
import { HistoryIcon } from '../../tools/components/Icons';
import { AnalyticsIcon, ReportsIcon, OverviewIcon as DashboardIcon } from '../../dashboard/components/Icons';
import { MediaIcon } from '../../media/Icon';
import { DocsIcon } from '../../studio/components/ToolIcons';
import { WebhooksIcon, SettingsIcon } from '../../systemsettings/components/Icons';
import { SearchIcon } from '../../../components/icons/InterfaceIcons';

interface KnowledgeBaseL3SidebarProps {
    activeL2Section: KnowledgeBaseSection;
    activeL3Section: ModuleSection;
    setActiveL3Section: (section: ModuleSection) => void;
}

const NavItem: React.FC<{ icon: React.FC<{className?: string}>, label: string, active?: boolean, onClick: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1 my-1
        ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
    >
        <Icon className="h-6 w-6 text-white mb-1" />
        <span className="text-white text-[10px] font-medium leading-tight text-center">{label}</span>
    </button>
);

const iconMap: Record<string, React.FC<{className?: string}>> = {
    // Curriculum
    "Browse": Icons.BrowseIcon,
    "Standards Alignment": Icons.StandardsAlignmentIcon,
    "Version History": HistoryIcon,
    // Assessments
    "Question Banks": Icons.QuestionBanksIcon,
    "Create Assessment": Icons.CreateAssessmentIcon,
    "Analytics": AnalyticsIcon,
    // Institutional Data
    "Data Sources": Icons.QuestionBanksIcon, // Reusing icon
    "Reports": ReportsIcon,
    "Dashboard": DashboardIcon,
    // Resource Library
    "Documents": DocsIcon,
    "Videos": MediaIcon,
    "Links": WebhooksIcon,
    // AI Search
    "Search Interface": SearchIcon,
    "Settings": SettingsIcon,
};


const KnowledgeBaseL3Sidebar: React.FC<KnowledgeBaseL3SidebarProps> = ({ activeL2Section, activeL3Section, setActiveL3Section }) => {
    const navItems = KNOWLEDGE_BASE_L3_MAP[activeL2Section] || [];
    
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-[#ca8a04] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1">
                    {navItems.map(section => (
                         <NavItem 
                            key={section}
                            icon={iconMap[section || ''] || Icons.BookmarksIcon}
                            label={section || ''}
                            active={activeL3Section === section}
                            onClick={() => setActiveL3Section(section)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};
export default KnowledgeBaseL3Sidebar;
