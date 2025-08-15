import React from 'react';
import * as Icons from './Icons';
import { AnnouncementsSection } from '../types';

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

interface AnnouncementsL2SidebarProps {
    activeSection: AnnouncementsSection;
    setActiveSection: (section: AnnouncementsSection) => void;
}

const sections: { id: AnnouncementsSection; label: string; icon: React.FC<any> }[] = [
    { id: 'All Announcements', label: 'All', icon: Icons.MegaphoneIcon },
    { id: 'Drafts', label: 'Drafts', icon: Icons.DraftsIcon },
    { id: 'Published', label: 'Published', icon: Icons.PublishedIcon },
];

const AnnouncementsL2Sidebar: React.FC<AnnouncementsL2SidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-cyber-purple/30 rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1 flex flex-col gap-1">
                    <NavItem 
                        label="New"
                        icon={Icons.ComposeIcon}
                        onClick={() => { /* New Announcement action */ }}
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

export default AnnouncementsL2Sidebar;
