
import React from 'react';
import * as Icons from './Icons';
import { VideoCallsSection } from '../types';

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

interface VideoCallsL2SidebarProps {
    activeSection: VideoCallsSection;
    setActiveSection: (section: VideoCallsSection) => void;
}

const sections: { id: VideoCallsSection; label: string; icon: React.FC<any> }[] = [
    { id: 'New Call', label: 'New Call', icon: Icons.VideoIcon },
    { id: 'History', label: 'History', icon: Icons.HistoryIcon },
    { id: 'Recordings', label: 'Recordings', icon: Icons.RecordingsIcon },
];

const VideoCallsL2Sidebar: React.FC<VideoCallsL2SidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-cyber-purple/30 rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1 flex flex-col gap-1">
                     <button
                        title="Schedule a Call"
                        className="w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1 bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30"
                    >
                        <Icons.CalendarIcon className="h-6 w-6 mb-1" />
                        <span className="text-[10px] font-bold leading-tight text-center">Schedule</span>
                    </button>

                    <div className="w-full h-px bg-cyber-border/50 my-1"></div>
                    {sections.map((item) => (
                        <NavItem key={item.id} {...item} active={activeSection === item.id} onClick={() => setActiveSection(item.id)} />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default VideoCallsL2Sidebar;
