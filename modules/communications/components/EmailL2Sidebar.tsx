
import React from 'react';
import * as Icons from './Icons';
import { EmailSection, InnovationSection } from '../types';

interface NavItemProps {
    icon: React.FC<{ className?: string }>;
    label: string;
    active?: boolean;
    onClick: () => void;
    isCompose?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, onClick, isCompose = false }) => {
    if (isCompose) {
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

interface EmailL2SidebarProps {
    activeSection: EmailSection | InnovationSection;
    setActiveSection: (section: EmailSection | InnovationSection) => void;
    onCompose: () => void;
}

const emailSections: { id: EmailSection; label: string; icon: React.FC<any> }[] = [
    { id: 'Inbox', label: 'Inbox', icon: Icons.InboxIcon },
    { id: 'Sent', label: 'Sent', icon: Icons.SentIcon },
    { id: 'Drafts', label: 'Drafts', icon: Icons.DraftsIcon },
    { id: 'Spam', label: 'Spam', icon: Icons.SpamIcon },
    { id: 'Archive', label: 'Archive', icon: Icons.ArchiveIcon },
];

const innovationSections: { id: InnovationSection; label: string; icon: React.FC<any> }[] = [
    { id: 'Smart Triage (AI)', label: 'Triage', icon: Icons.TriageIcon },
    { id: 'AI Scribe', label: 'AI Scribe', icon: Icons.ScribeIcon },
    { id: 'Contact Hub', label: 'Contacts', icon: Icons.ContactsIcon },
    { id: 'Thread Weaver', label: 'Threads', icon: Icons.ThreadIcon },
];

const EmailL2Sidebar: React.FC<EmailL2SidebarProps> = ({ activeSection, setActiveSection, onCompose }) => {
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-cyber-purple/30 rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1 flex flex-col gap-1">
                    <NavItem 
                        label="Compose"
                        icon={Icons.ComposeIcon}
                        onClick={onCompose}
                        isCompose
                    />
                
                    <div className="w-full h-px bg-cyber-border/50 my-1"></div>

                    {emailSections.map((item) => (
                        <NavItem key={item.id} {...item} active={activeSection === item.id} onClick={() => setActiveSection(item.id)} />
                    ))}
                    
                    <div className="my-2">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">AI</h3>
                    </div>

                    {innovationSections.map((item) => (
                        <NavItem key={item.id} {...item} active={activeSection === item.id} onClick={() => setActiveSection(item.id)} />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default EmailL2Sidebar;
