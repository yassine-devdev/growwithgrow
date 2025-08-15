import React from 'react';
import * as Icons from './Icons';
import { TemplatesSection } from '../types';

interface NavItemProps {
    icon: React.FC<{ className?: string }>;
    label: string;
    active?: boolean;
    onClick: () => void;
    isAction?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, onClick, isAction = false }) => {
    if (isAction) {
        return (
             <button
                onClick={onClick}
                title={label}
                className="w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1 bg-cyber-cyan text-black hover:bg-white"
            >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-bold leading-tight text-center">{label}</span>
            </button>
        )
    }
    
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

interface TemplatesL2SidebarProps {
    activeSection: TemplatesSection;
    setActiveSection: (section: TemplatesSection) => void;
}

const sections: { id: TemplatesSection; label: string; icon: React.FC<any> }[] = [
    { id: 'My Templates', label: 'My Templates', icon: Icons.TemplatesIcon },
    { id: 'Team Templates', label: 'Team', icon: Icons.TeamIcon },
    { id: 'Analytics', label: 'Analytics', icon: Icons.AnalyticsIcon },
];

const TemplatesL2Sidebar: React.FC<TemplatesL2SidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-cyber-purple/30 rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1 flex flex-col gap-1">
                    <NavItem 
                        label="Create New"
                        icon={Icons.ComposeIcon}
                        onClick={() => { /* Create New action */ }}
                        isAction
                    />
                    <div className="w-full h-px bg-cyber-border/50 my-1"></div>
                    {sections.map((item) => (
                        <NavItem key={item.id} {...item} active={activeSection === item.id} onClick={() => setActiveSection(item.id)} />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default TemplatesL2Sidebar;
