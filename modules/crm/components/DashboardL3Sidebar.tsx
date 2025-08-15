
import React from 'react';
import { CRMDashboardSection } from '../../types';
import { CRM_DASHBOARD_SECTIONS_L3 } from '../../../constants';
import * as Icons from './Icons';

interface DashboardL3SidebarProps {
    activeSection: CRMDashboardSection;
    setActiveSection: (section: CRMDashboardSection) => void;
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

const iconMap: Record<CRMDashboardSection, React.FC<{className?: string}>> = {
    'Overview': Icons.OverviewIcon,
    'Team Performance': Icons.TeamPerformanceIcon,
    'My Tasks': Icons.TasksIcon,
};


const DashboardL3Sidebar: React.FC<DashboardL3SidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-[#4a044e] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1">
                    {CRM_DASHBOARD_SECTIONS_L3.map(section => (
                        <NavItem 
                            key={section}
                            icon={iconMap[section]}
                            label={section}
                            active={activeSection === section}
                            onClick={() => setActiveSection(section)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default DashboardL3Sidebar;
