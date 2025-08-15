import React from 'react';
import { SystemSettingsSection } from '../types';
import { Settings, Users, Shield, Plug, Brush, Stamp } from 'lucide-react';

interface NavItemProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1
        ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
    >
        <Icon size={24} className="text-white mb-1" />
        <span className="text-white text-[10px] font-medium leading-tight text-center">{label}</span>
    </button>
);

interface SystemSettingsL2SidebarProps {
    activeSection: SystemSettingsSection;
    setActiveSection: (section: SystemSettingsSection) => void;
}

const SystemSettingsL2Sidebar: React.FC<SystemSettingsL2SidebarProps> = ({ activeSection, setActiveSection }) => {
    const navItems = [
        { id: 'General' as SystemSettingsSection, icon: Settings, label: 'General' },
        { id: 'Users' as SystemSettingsSection, icon: Users, label: 'Users' },
        { id: 'Security' as SystemSettingsSection, icon: Shield, label: 'Security' },
        { id: 'Integrations' as SystemSettingsSection, icon: Plug, label: 'Integrations' },
        { id: 'Branding' as SystemSettingsSection, icon: Brush, label: 'Branding' },
        { id: 'Theme' as SystemSettingsSection, icon: Stamp, label: 'Theme' },
    ];

    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start pt-8 px-2">
            <div className="bg-cyber-purple/30 rounded-2xl p-2 shadow-lg">
                <nav className="w-full flex flex-col gap-2">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeSection === item.id}
                            onClick={() => setActiveSection(item.id)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default SystemSettingsL2Sidebar;