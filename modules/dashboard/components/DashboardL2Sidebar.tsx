

import React, { useState } from 'react';
import { OverviewIcon, AnalyticsIcon, ReportsIcon, SettingsIcon } from './Icons';

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        aria-label={`Navigate to ${label} section`}
        aria-current={active ? 'page' : undefined}
        className={`relative w-full h-[70px] flex flex-col items-center justify-center rounded-xl transition-all duration-300 p-1 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2 focus:ring-offset-cyber-bg
        ${active 
            ? 'bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/20 shadow-glow-cyan border border-cyber-cyan/30' 
            : 'hover:bg-gradient-to-br hover:from-white/10 hover:to-cyber-cyan/5 hover:shadow-glow-cyan/30 border border-transparent hover:border-cyber-cyan/20'
        }`}
    >
        {/* Active indicator line */}
        {active && (
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyber-cyan to-cyber-purple rounded-r-full shadow-glow-cyan" />
        )}
        
        {/* Hover glow effect */}
        <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
        } bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/10`} />
        
        {/* Icon with enhanced styling */}
        <div className={`relative z-10 transition-all duration-300 ${
            active ? 'scale-110' : 'group-hover:scale-105'
        }`}>
            <Icon className={`h-6 w-6 mb-1 transition-all duration-300 ${
                active ? 'text-cyber-cyan drop-shadow-glow-cyan' : 'text-white group-hover:text-cyber-cyan'
            }`} />
        </div>
        
        {/* Label with enhanced typography */}
        <span className={`relative z-10 text-[10px] font-semibold leading-tight text-center transition-all duration-300 font-mono ${
            active ? 'text-cyber-cyan' : 'text-white/80 group-hover:text-white'
        }`}>{label}</span>
        
        {/* Subtle pulse animation for active state */}
        {active && (
            <div className="absolute inset-0 rounded-xl animate-pulse bg-gradient-to-br from-cyber-cyan/10 to-cyber-purple/5" />
        )}
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
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start pt-8 px-2" role="navigation" aria-label="Dashboard navigation">
            <div className="relative bg-gradient-to-b from-cyber-cyan/20 to-cyber-purple/10 rounded-2xl p-2 shadow-glow-cyan/20 border border-cyber-cyan/20 backdrop-blur-sm">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyber-cyan/5 to-transparent opacity-50" />
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_20%,rgba(0,255,255,0.1),transparent_50%)]" />
                
                <nav className="relative z-10 w-full flex flex-col gap-2">
                    {navItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={activeItem === item.id}
                                onClick={() => setActiveItem(item.id)}
                            />
                        </div>
                    ))}
                </nav>
                
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyber-cyan/20 via-cyber-purple/10 to-cyber-cyan/20 opacity-30 blur-sm" />
            </div>
        </aside>
    );
};

export default DashboardL2Sidebar;
