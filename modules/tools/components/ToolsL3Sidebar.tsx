import React from 'react';
import { ModuleSection } from '../../../types';
import { ToolsSection } from '../types';
import { TOOLS_L3_MAP } from '../../../constants';
import * as Icons from './Icons';
import { AnalyticsIcon as CRMAnalyticsIcon, ForecastingIcon } from '../../crm/components/Icons';
import { UserManagementIcon, ApiKeysIcon, EmailTemplatesIcon } from '../../systemsettings/components/Icons';
import { DocsIcon, GalleryIcon } from '../../studio/components/ToolIcons';

interface ToolsL3SidebarProps {
    activeL2Section: ToolsSection;
    activeL3Section: ModuleSection;
    setActiveL3Section: (section: ModuleSection) => void;
}

const NavItem: React.FC<{ icon: React.FC<{className?: string}>, label: string, active?: boolean, onClick: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-full h-[60px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1
        ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
    >
        <Icon className="h-5 w-5 text-white" />
        <span className="text-white text-[10px] font-medium leading-tight text-center mt-1">{label}</span>
    </button>
);

const iconMap: Record<string, React.FC<{className?: string}>> = {
    // Overview
    "Key Dashboards": Icons.KeyDashboardsIcon,
    "Custom Reports": Icons.CustomReportsIcon,
    "Data Sources": Icons.DataSourcesIcon,
    "Causal Inference (AI)": Icons.CausalInferenceIcon,
    "Scenario Forecast": Icons.ScenarioForecastIcon,
    "Data Storyteller (AI)": Icons.DataStorytellerIcon,
    // Marketing is handled by MarketingL4Sidebar
    // Finance
    "Expense Tracker": Icons.ExpenseTrackerIcon,
    "Invoice Generator": DocsIcon,
    "Budget Forecaster": ForecastingIcon,
    // AI
    "Text Generator": Icons.PromptIcon,
    "Chart Generator": CRMAnalyticsIcon,
    "Image Generator": GalleryIcon,
    // Setting
    "API Keys": ApiKeysIcon,
    "Usage Limits": Icons.UsageLimitsIcon,
    "Defaults": Icons.SettingsIcon,
};


const ToolsL3Sidebar: React.FC<ToolsL3SidebarProps> = ({ activeL2Section, activeL3Section, setActiveL3Section }) => {
    const navItems = TOOLS_L3_MAP[activeL2Section] || [];
    
    return (
        <aside className="w-24 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-[#581c87] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1">
                    {navItems.map(section => (
                         <NavItem 
                            key={section}
                            icon={iconMap[section || ''] || Icons.SettingsIcon}
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
export default ToolsL3Sidebar;
