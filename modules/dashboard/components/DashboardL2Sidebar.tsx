

import React, { useState } from 'react';
import { OverviewIcon, AnalyticsIcon, ReportsIcon, SettingsIcon } from './Icons';

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
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

const DashboardL2Sidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState('overview');
    const navItems = [
        { id: 'overview', icon: OverviewIcon, label: 'Overview' },
        { id: 'analytics', icon: AnalyticsIcon, label: 'Analytics' },
        { id: 'reports', icon: ReportsIcon, label: 'Reports' },
        { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    ];

    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start pt-8 px-2">
            <div className="bg-[#15803d] rounded-2xl p-2 shadow-lg">
                <nav className="w-full flex flex-col gap-2">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeItem === item.id}
                            onClick={() => setActiveItem(item.id)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default DashboardL2Sidebar;
