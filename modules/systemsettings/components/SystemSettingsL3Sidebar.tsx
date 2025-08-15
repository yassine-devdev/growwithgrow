

import React from 'react';
import { ModuleSection } from '../../../types';
import { SystemSettingsSection } from '../types';
import { SYSTEM_SETTINGS_L3_MAP } from '../../../constants';
import * as Icons from './Icons';

interface SystemSettingsL3SidebarProps {
    activeL2Section: SystemSettingsSection;
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
    // General
    "Profile": Icons.ProfileIcon,
    "Appearance": Icons.AppearanceIcon,
    "Localization": Icons.LocalizationIcon,
    "AI": Icons.AIIcon,
    // Users
    "All Users": Icons.UserManagementIcon,
    "Roles & Permissions": Icons.RolesIcon,
    "Invitations": Icons.InvitationsIcon,
    // Integrations
    "Connected Apps": Icons.AppsIcon,
    "API Keys": Icons.ApiKeysIcon,
    "Webhooks": Icons.WebhooksIcon,
    // Branding
    "Logo & Colors": Icons.BrandingIcon,
    "Email Templates": Icons.EmailTemplatesIcon,
    "Login Screen": Icons.LoginScreenIcon,
};


const SystemSettingsL3Sidebar: React.FC<SystemSettingsL3SidebarProps> = ({ activeL2Section, activeL3Section, setActiveL3Section }) => {
    const navItems = SYSTEM_SETTINGS_L3_MAP[activeL2Section] || [];
    
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-[#475569] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
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
export default SystemSettingsL3Sidebar;
