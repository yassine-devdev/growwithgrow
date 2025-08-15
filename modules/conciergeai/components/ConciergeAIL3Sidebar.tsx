
import React from 'react';
import { ModuleSection } from '../../../types';
import { ConciergeAISection } from '../types';
import { CONCIERGE_AI_L3_MAP } from '../../../constants';
import * as Icons from './Icons';
import { ReportsIcon as AnalyticsIcon } from '../../dashboard/components/Icons';

interface ConciergeAIL3SidebarProps {
    activeL2Section: ConciergeAISection;
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
    // Schools
    "Manage Schools": Icons.SettingsIcon,
    "Onboarding": Icons.OnboardingIcon,
    "Analytics": AnalyticsIcon,
    // System Prompts
    "Prompt Library": Icons.AutomationIcon,
    "Create New Prompt": Icons.PromptIcon,
    "Performance": Icons.ReportsIcon,
    // Usage Analytics
    "Overall Usage": AnalyticsIcon,
    "By School": AnalyticsIcon,
    "Cost Analysis": AnalyticsIcon,
    // Global Settings
    "Model Configuration": Icons.SettingsIcon,
    "Safety Filters": Icons.ApiKeysIcon,
    "Data Retention": Icons.DataRetentionIcon,
    // Chat
    "Chat": Icons.ChatIcon,
    "Report": Icons.ReportsIcon,
    "Automation": Icons.AutomationIcon,
};


const ConciergeAIL3Sidebar: React.FC<ConciergeAIL3SidebarProps> = ({ activeL2Section, activeL3Section, setActiveL3Section }) => {
    const navItems = CONCIERGE_AI_L3_MAP[activeL2Section] || [];
    
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-[#1e1b4b] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1">
                    {navItems.map(section => (
                         <NavItem 
                            key={section as string}
                            icon={iconMap[section as string] || Icons.SettingsIcon}
                            label={section as string}
                            active={activeL3Section === section}
                            onClick={() => setActiveL3Section(section)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};
export default ConciergeAIL3Sidebar;
